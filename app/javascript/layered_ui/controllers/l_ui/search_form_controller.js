import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"

// Long enough that a typed word is one request rather than one per letter.
// Longer than the combobox's debounce: a search here re-renders a whole
// collection, so a keystroke costs more than a listbox fetch does.
const SEARCH_DEBOUNCE = 300

// A frame render replaces the form, and with it the input being typed into, so
// what was typed, where the caret was, and whether the field had focus are held
// here - outside the DOM, which is the only place that survives - and restored
// by the controller that connects in the replacement's place. Keyed per form,
// so two collections on one page never restore into each other.
const stashes = new Map()

// Older than this and the search has been walked away from (a full load, a sort
// link, the back button), so focus is left where the user put it.
const STASH_TTL = 5000

// When multiple scoped Ransack collections share one page, preserves other
// scopes' params across form submits (preserve), clear links (clear), and
// pagination clicks (rewriteLink). In live mode it also searches as the user
// types, carrying the caret across the frame render that answers.
export default class extends Controller {
  static targets = ["input", "clear"]
  static values = {
    scope: String,
    live: { type: Boolean, default: false },
    minChars: { type: Number, default: 0 },
    // -1 means the caller passed no count, so there is nothing to announce.
    count: { type: Number, default: -1 }
  }

  connect() {
    this._searchTimer = null
    this._restore()
    this._refreshClear()
  }

  disconnect() {
    clearTimeout(this._searchTimer)
    // An announcement schedules the shared region to be blanked a few seconds
    // later. This instance is about to be replaced by the frame render that
    // answers the search, and its pending blank would wipe whatever the
    // instance connecting in its place has just announced.
    clearAnnounceTimeout(this)
  }

  // Typing searches. Debounced, so a fast typist sends one request for a word.
  search(event) {
    // A half-composed IME string is not a term yet.
    if (event && event.isComposing) return

    this._stash()
    this._refreshClear()
    this._schedule()
  }

  // The in-field clear button, and Escape in the field. Clearing is a search for
  // the empty term, and an intentional one, so it skips the debounce.
  clearSearch(event) {
    if (event) event.preventDefault()
    if (!this.hasInputTarget) return

    this.inputTarget.value = ""
    // Focused before the button hides itself: focus would otherwise fall to the
    // body, losing the user's place (WCAG 2.4.3).
    this.inputTarget.focus()
    this._refreshClear()
    this.submitNow()
  }

  submitNow() {
    clearTimeout(this._searchTimer)

    const term = this._term
    // Too short to be worth asking about, but not yet abandoned.
    if (term.length > 0 && term.length < this.minCharsValue) return
    if (term === this._sent) return

    // requestSubmit, not submit: it fires the submit event, so `preserve` runs
    // and the form's own data-turbo-action is honoured.
    this.element.requestSubmit()
  }

  // Every submit - typed, Enter, or the clear button - lands here, so this is
  // where the pending search is settled and the field's state is recorded for
  // the render that is about to replace it.
  preserve(event) {
    clearTimeout(this._searchTimer)
    this._sent = this._term
    this._stash({ submitted: this._sent })

    this.element.querySelectorAll("[data-l-ui-preserved]").forEach(el => el.remove())

    for (const [key, value] of this.#otherParams()) {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value
      input.setAttribute("data-l-ui-preserved", "")
      this.element.appendChild(input)
    }
  }

  clear(event) {
    const link = event.currentTarget
    const preserved = this.#otherParams()
    const base = link.href.split("?")[0]
    const qs = preserved.toString()
    link.href = qs ? `${base}?${qs}` : base
  }

  rewriteLink(event) {
    const link = event.target.closest(".l-ui-pagy-container a[href]")
    if (!link) return

    const url = new URL(link.href, window.location.origin)
    const linkKeys = new Set(url.searchParams.keys())

    for (const [key, value] of this.#otherParams()) {
      if (!linkKeys.has(key)) url.searchParams.append(key, value)
    }

    link.href = url.pathname + url.search
  }

  _schedule() {
    clearTimeout(this._searchTimer)
    this._searchTimer = setTimeout(() => this.submitNow(), SEARCH_DEBOUNCE)
  }

  _stash(extra = {}) {
    if (!this.hasInputTarget) return

    const input = this.inputTarget
    stashes.set(this._key, {
      ...(stashes.get(this._key) || {}),
      value: input.value,
      start: input.selectionStart,
      end: input.selectionEnd,
      focused: document.activeElement === input,
      at: Date.now(),
      ...extra
    })
  }

  _restore() {
    const stash = stashes.get(this._key)
    if (!stash) return
    stashes.delete(this._key)

    // Only a render that answers a search of ours takes focus back: a sort link
    // or a page link renders the same frame, and must not.
    if (!("submitted" in stash)) return
    if (Date.now() - stash.at > STASH_TTL) return
    if (!this.hasInputTarget) return

    this._sent = stash.submitted

    // The response echoes the term it searched for; anything typed while it was
    // in flight is newer, and wins.
    if (this.inputTarget.value !== stash.value) this.inputTarget.value = stash.value

    if (stash.focused) {
      this.inputTarget.focus({ preventScroll: true })
      this.inputTarget.setSelectionRange(stash.start, stash.end)
    }

    this._announceResults(stash.value)

    // Keystrokes that landed after the request went out are still unsearched.
    if (stash.value !== stash.submitted) this._schedule()
  }

  // The count is rendered onto the form by the response, so it is the new count
  // by the time this runs. The region it goes to lives in the layout, outside
  // every frame: a live region replaced in the same render as its own text is
  // not reliably announced.
  _announceResults(term) {
    if (this.countValue < 0) return

    const count = this.countValue
    const results = count === 0 ? "No results" : count === 1 ? "1 result" : `${count} results`

    // The term is included so consecutive searches never repeat a string
    // verbatim - identical text in a live region is not announced again.
    announce(term ? `${results} for ${term}` : results, this)
  }

  _refreshClear() {
    if (this.hasClearTarget) this.clearTarget.hidden = this._term.length === 0
  }

  get _term() {
    return this.hasInputTarget ? this.inputTarget.value : ""
  }

  get _key() {
    return `${this.scopeValue}|${this.element.action}`
  }

  #otherParams() {
    const currentParams = new URLSearchParams(window.location.search)
    const scope = this.scopeValue
    const result = new URLSearchParams()

    for (const [key, value] of currentParams) {
      if (key === scope || key.startsWith(scope + "[") || key === "commit" || key === "page" || key === this.#pageParam) continue
      result.append(key, value)
    }

    return result
  }

  get #pageParam() {
    const scope = this.scopeValue
    return scope.endsWith("_q") ? scope.slice(0, -2) + "_page" : null
  }
}
