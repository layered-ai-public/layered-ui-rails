import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"

// Longer than the combobox's: a search re-renders a whole collection, so a
// keystroke costs more here than a listbox fetch does.
const SEARCH_DEBOUNCE = 300

// A frame render destroys the input being typed into, so the field's state is
// held outside the DOM and restored by the controller that connects in its
// place. Keyed per form: two collections on a page must not restore into each
// other.
const stashes = new Map()

// Older than this and the search has been walked away from, so focus is left
// where the user since put it.
const STASH_TTL = 5000

// When multiple scoped Ransack collections share one page, preserves other
// scopes' params across form submits (preserve), clear links (clear), and
// pagination clicks (rewriteLink). In live mode it also searches as the user
// types, carrying the caret across the frame render that answers.
export default class extends Controller {
  static targets = ["input", "clear"]
  static values = {
    scope: String,
    // Given, not derived from scope: Pagy's page key is the host's choice and
    // follows no rule relating it to the Ransack search key.
    pageParam: { type: String, default: "page" },
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
    // An announcement schedules the shared region to be blanked. Left pending,
    // it would wipe what the instance replacing this one has just announced.
    clearAnnounceTimeout(this)
  }

  search(event) {
    // A half-composed IME string is not a term yet.
    if (event && event.isComposing) return

    this._stash()
    this._refreshClear()
    this._schedule()
  }

  // The in-field clear button, and Escape in the field. An intentional search
  // for the empty term, so it skips the debounce.
  clearSearch(event) {
    if (event) event.preventDefault()
    if (!this.hasInputTarget) return

    this.inputTarget.value = ""
    // Focused before the button hides itself, or focus falls to the body and
    // the user loses their place (WCAG 2.4.3).
    this.inputTarget.focus()
    this._refreshClear()
    // No input event fires for this, and submitNow declines when the empty term
    // is already in flight - so without this the stash keeps the old text, and
    // the pending response restores it over the cleared field and searches it.
    this._stash()
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

  // Every submit lands here - typed, Enter, or the clear button - so it is
  // where the field's state is recorded for the render about to replace it.
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

    // Anything typed while the request was in flight is newer than the term the
    // response echoes, and wins.
    if (this.inputTarget.value !== stash.value) this.inputTarget.value = stash.value

    // The stash says the field had focus when the request went out, not whether
    // it still should. A control outside the frame survives the render and is
    // still focused; only focus left on the body was destroyed with the input,
    // and an answer arriving must not pull the user back (WCAG 3.2.5).
    const focusWentNowhere = !document.activeElement || document.activeElement === document.body
    if (stash.focused && focusWentNowhere) {
      this.inputTarget.focus({ preventScroll: true })
      this.inputTarget.setSelectionRange(stash.start, stash.end)
    }

    // The count answers the term submitted, not what has been typed since, so
    // announcing waits until they agree - the scheduling below means a truer
    // answer is already on its way.
    if (stash.value === stash.submitted) this._announceResults(stash.submitted)

    // Keystrokes that landed after the request went out are still unsearched.
    if (stash.value !== stash.submitted) this._schedule()
  }

  // The response renders the count onto the form, so it is already the new one
  // here. It goes to the layout's region, outside every frame: a live region
  // replaced in the same render as its own text is not reliably announced.
  _announceResults(term) {
    if (this.countValue < 0) return

    const count = this.countValue
    const results = count === 0 ? "No results" : count === 1 ? "1 result" : `${count} results`

    // The term is included so no two announcements repeat verbatim - identical
    // text in a live region is not announced again.
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
      if (key === scope || key.startsWith(scope + "[") || key === "commit" || key === this.pageParamValue) continue
      result.append(key, value)
    }

    return result
  }
}
