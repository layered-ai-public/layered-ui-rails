import { Controller } from "@hotwired/stimulus"

// Drives the token select rendered by `l_ui_combobox`: type-ahead filtering of
// a listbox, selections held as removable tokens, optional creation of values
// that aren't in the list, and optional reordering.
//
// The markup follows the ARIA combobox pattern - the text input owns the
// listbox via aria-controls and points at the highlighted option with
// aria-activedescendant, so focus never leaves the input while browsing. DOM
// focus therefore only moves for the token controls, which are ordinary
// buttons.
//
// With `url` set, the options are fetched from that endpoint as the user types
// instead of being filtered in the browser, and each response replaces the
// list - cloned from the option <template> so remote options are built from the
// same markup as server-rendered ones. Further pages are appended as the user
// reaches the end of the list, by pointer and by keyboard alike.
//
// Each selection carries its own hidden input, so the control submits with a
// normal form post. Values that exist in the collection post under `name`;
// created values post under `createName`, keeping record IDs and free text
// unambiguous server-side.
// Long enough that a typed word is one request rather than one per letter,
// short enough that the list still feels like it is keeping up.
const SEARCH_DEBOUNCE = 200

// How close to the foot of the list counts as reaching the end, in pixels.
// Roughly an option's height, so the next page is on its way before the last
// option is fully in view.
const LOAD_MORE_MARGIN = 64

export default class extends Controller {
  static targets = [
    "control", "tokens", "token", "input", "listbox", "option", "empty",
    "notice", "template", "optionTemplate", "status"
  ]

  static values = {
    multiple: { type: Boolean, default: true },
    create: { type: Boolean, default: false },
    reorder: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    name: String,
    createName: String,
    url: String,
    minChars: { type: Number, default: 0 }
  }

  connect() {
    this._activeId = null
    this._dragging = null
    this._dragOrigin = null
    this._dropped = false
    this._searchTimer = null
    this._request = null
    this._loading = false
    this._loadingMore = false
    // The term the list currently shows results for; null until the first
    // response, which is how a remote combobox knows it has nothing yet.
    this._loadedTerm = null
    this._page = 0
    this._pages = 0
    this._count = 0
    // Option ids run on across pages, so appending a page can never reuse an
    // id that aria-activedescendant might still be pointing at.
    this._optionSequence = 0
    this._refreshMoveControls()
  }

  disconnect() {
    clearTimeout(this._searchTimer)
    this._abort()
  }

  get isRemote() {
    return this.urlValue !== ""
  }

  // Clicking anywhere in the control (the padding around the tokens, say)
  // behaves like clicking the input, matching a native text field.
  focusInput(event) {
    if (event.target.closest("button")) return
    this.inputTarget.focus()
  }

  open() {
    // Includes the case of the term being cleared after a selection, where the
    // list has to go back to the unfiltered first page.
    if (this.isRemote && this._loadedTerm !== this._term) {
      this._scheduleSearch({ immediate: this._loadedTerm === null })
    }

    this._filterOptions()
    this.listboxTarget.hidden = false
    this.inputTarget.setAttribute("aria-expanded", "true")
  }

  close() {
    this.listboxTarget.hidden = true
    this.inputTarget.setAttribute("aria-expanded", "false")
    this._setActive(null)
  }

  get isOpen() {
    return !this.listboxTarget.hidden
  }

  blur() {
    this.close()
  }

  // Reaching the foot of a remote list asks for the next page. The keyboard
  // path is in _moveActive, so neither pointer nor keyboard is capped at the
  // first page.
  scrolled() {
    if (!this._hasMore) return

    const list = this.listboxTarget
    if (list.scrollHeight - list.scrollTop - list.clientHeight > LOAD_MORE_MARGIN) return

    this._loadMore()
  }

  filter() {
    // The highlight and the announcement wait for the response, since there is
    // nothing yet to say how many options the term has.
    if (this.isRemote) {
      this._scheduleSearch()
      this._filterOptions()
      this.listboxTarget.hidden = false
      this.inputTarget.setAttribute("aria-expanded", "true")
      this._setActive(null)
      return
    }

    this.open()

    const visible = this._visibleOptions()

    // Highlighting the best match while typing makes Enter mean "take this
    // one". With no term there is no best match, so nothing is highlighted and
    // Enter is left to the form.
    if (this.inputTarget.value.trim() === "") {
      this._setActive(null)
      return
    }

    this._setActive(visible[0] || null)
    this._announce(`${visible.length} ${visible.length === 1 ? "option" : "options"} available`)
  }

  keydown(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        this.isOpen ? this._moveActive(1) : this.open()
        if (!this._activeId) this._setActive(this._visibleOptions()[0] || null)
        break
      case "ArrowUp": {
        event.preventDefault()
        this.isOpen ? this._moveActive(-1) : this.open()
        const visible = this._visibleOptions()
        if (!this._activeId) this._setActive(visible[visible.length - 1] || null)
        break
      }
      case "Home":
        if (!this.isOpen) return
        event.preventDefault()
        this._setActive(this._visibleOptions()[0] || null)
        break
      case "End": {
        if (!this.isOpen) return
        event.preventDefault()
        const visible = this._visibleOptions()
        this._setActive(visible[visible.length - 1] || null)
        // The end of a partly loaded list is not the end of the matches, so the
        // next page is fetched and left for the arrow keys to walk into.
        if (this._hasMore) this._loadMore()
        break
      }
      case "Enter": {
        const active = this._activeOption()
        if (!active) return
        // Only swallow the key when it acts on the listbox, so Enter still
        // submits the surrounding form when nothing is highlighted.
        event.preventDefault()
        this._chooseOption(active)
        break
      }
      // Escape is swallowed only when it acts on the combobox: the layout binds
      // it at window level to close the panel and the navigation menu, and a
      // combobox inside a modal would otherwise trigger the dialog's native
      // cancel - so dismissing the listbox would take the surrounding form
      // with it.
      case "Escape":
        if (this.isOpen) {
          event.preventDefault()
          event.stopPropagation()
          this.close()
        } else if (this.inputTarget.value !== "") {
          event.preventDefault()
          event.stopPropagation()
          this.inputTarget.value = ""
          this._filterOptions()
        }
        break
      case "Backspace": {
        if (this.inputTarget.value !== "") return
        const tokens = this.tokenTargets
        if (tokens.length === 0) return
        event.preventDefault()
        this._removeToken(tokens[tokens.length - 1])
        break
      }
      case "Tab":
        this.close()
        break
    }
  }

  // Bound to mousedown rather than click: mousedown fires before the input's
  // blur, so preventing its default keeps focus in the input and stops the
  // listbox closing out from under the pointer.
  selectOption(event) {
    event.preventDefault()
    this._chooseOption(event.currentTarget)
  }

  removeToken(event) {
    this._removeToken(event.currentTarget.closest(".l-ui-combobox__token"))
    this.inputTarget.focus()
  }

  moveTokenEarlier(event) {
    this._moveToken(event.currentTarget, -1)
  }

  moveTokenLater(event) {
    this._moveToken(event.currentTarget, 1)
  }

  // Dragging is a pointer enhancement only; the move buttons remain the
  // accessible path (and the only path on touch), as SC 2.5.7 requires.
  dragstart(event) {
    const token = event.target.closest(".l-ui-combobox__token")
    if (!token || !this.reorderValue) return

    this._dragging = token
    // Remembered so a cancelled drag can undo the live rearrangement below.
    this._dragOrigin = token.nextElementSibling
    this._dropped = false
    token.classList.add("l-ui-combobox__token--dragging")
    event.dataTransfer.effectAllowed = "move"
    // Firefox ignores a drag that carries no data.
    event.dataTransfer.setData("text/plain", "")
  }

  dragover(event) {
    if (!this._dragging) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"

    const target = event.target.closest(".l-ui-combobox__token")
    if (!target || target === this._dragging) return

    const midpoint = target.getBoundingClientRect().left + target.offsetWidth / 2
    target.parentNode.insertBefore(
      this._dragging,
      event.clientX < midpoint ? target : target.nextSibling
    )
  }

  drop(event) {
    if (!this._dragging) return
    event.preventDefault()
    this._dropped = true
    this.dragend()
  }

  dragend() {
    if (!this._dragging) return

    const token = this._dragging
    token.classList.remove("l-ui-combobox__token--dragging")
    this._dragging = null

    // dragover rearranges the tokens as the pointer moves, so a drag that ends
    // without a drop (Escape mid-drag, or a release outside the list) has to
    // put the token back rather than commit - and announce nothing, since
    // nothing moved.
    if (this._dropped) {
      this._announce(this._movedMessage(token))
    } else {
      this.tokensTarget.insertBefore(token, this._dragOrigin)
    }

    this._dropped = false
    this._dragOrigin = null
    this._refreshMoveControls()
  }

  // Private

  _chooseOption(option) {
    const value = option.dataset.value
    const label = option.dataset.label
    const isNew = option.dataset.new === "true"
    const existing = this._tokenFor(value, isNew)

    if (existing && this.multipleValue) {
      this._removeToken(existing)
    } else if (!existing) {
      this._addToken({ value, label, isNew })
    }

    this.inputTarget.value = ""
    this.inputTarget.focus()

    if (this.multipleValue) {
      this.open()
      this._setActive(null)
    } else {
      this.close()
    }
  }

  _addToken({ value, label, isNew }) {
    if (!this.multipleValue) {
      this.tokenTargets.forEach((token) => this._detachToken(token))
    }

    const token = this.templateTarget.content.firstElementChild.cloneNode(true)
    token.dataset.value = value
    token.dataset.new = String(isNew)
    token.querySelector(".l-ui-tag__label").textContent = label

    const input = token.querySelector("input[type=hidden]")
    input.name = isNew ? this.createNameValue : this.nameValue
    input.value = value

    token.querySelectorAll("button").forEach((button) => {
      const action = button.dataset.action || ""
      if (action.includes("removeToken")) button.setAttribute("aria-label", `Remove ${label}`)
      if (action.includes("moveTokenEarlier")) button.setAttribute("aria-label", `Move ${label} earlier`)
      if (action.includes("moveTokenLater")) button.setAttribute("aria-label", `Move ${label} later`)
    })

    this.tokensTarget.appendChild(token)
    this._markOption(value, isNew, true)
    this._refreshMoveControls()
    this._announce(`${label} added`)
  }

  _removeToken(token) {
    const label = token.querySelector(".l-ui-tag__label").textContent
    this._detachToken(token)
    this._refreshMoveControls()
    this._filterOptions()
    this._announce(`${label} removed`)
  }

  _detachToken(token) {
    this._markOption(token.dataset.value, token.dataset.new === "true", false)
    token.remove()
  }

  _moveToken(button, offset) {
    const token = button.closest(".l-ui-combobox__token")
    const sibling = offset < 0 ? token.previousElementSibling : token.nextElementSibling
    if (!sibling) return

    offset < 0
      ? this.tokensTarget.insertBefore(token, sibling)
      : this.tokensTarget.insertBefore(sibling, token)

    this._refreshMoveControls()
    this._announce(this._movedMessage(token))

    // The button that was just pressed may now be disabled (the token reached
    // an end), which would drop focus to the document, so hand focus to the
    // control that can still act on this token.
    if (button.disabled) {
      const alternative = token.querySelector(".l-ui-combobox__move:not([disabled])")
      alternative ? alternative.focus() : token.querySelector(".l-ui-tag__remove").focus()
    } else {
      button.focus()
    }
  }

  _movedMessage(token) {
    const label = token.querySelector(".l-ui-tag__label").textContent
    const position = this.tokenTargets.indexOf(token) + 1
    return `${label} moved to position ${position} of ${this.tokenTargets.length}`
  }

  // Only the first token's "earlier" control and the last token's "later"
  // control are dead ends, so those are the ones disabled. A disabled combobox
  // is left alone, so its controls stay disabled.
  _refreshMoveControls() {
    if (!this.reorderValue || this.disabledValue) return

    const tokens = this.tokenTargets
    tokens.forEach((token, index) => {
      const [earlier, later] = token.querySelectorAll(".l-ui-combobox__move")
      if (earlier) earlier.disabled = index === 0
      if (later) later.disabled = index === tokens.length - 1
    })
  }

  _tokenFor(value, isNew) {
    return this.tokenTargets.find(
      (token) => token.dataset.value === value && (token.dataset.new === "true") === isNew
    )
  }

  _markOption(value, isNew, selected) {
    if (isNew) return

    const option = this.optionTargets.find((candidate) => candidate.dataset.value === value)
    if (option) option.setAttribute("aria-selected", String(selected))
  }

  // Hides options that don't match the term, and maintains the "add this
  // value" option and the empty-state message.
  _filterOptions() {
    const term = this.inputTarget.value.trim().toLowerCase()

    // A remote list is already the answer for the term, so filtering it again
    // in the browser would only hide options the server chose to return.
    if (!this.isRemote) {
      this.optionTargets.forEach((option) => {
        option.hidden = term !== "" && !option.dataset.label.toLowerCase().includes(term)
      })
    }

    this._refreshCreateOption(term)

    // "No matches" is a result, so it is only shown once the list has one: not
    // while a search is in flight, and not before the term is long enough for
    // one to have run.
    if (this.hasEmptyTarget) {
      this.emptyTarget.hidden = this._visibleOptions().length > 0 || this._loading || this._belowThreshold
    }
  }

  _refreshCreateOption(term) {
    const exists =
      term === "" ||
      this.optionTargets.some((option) => option.dataset.label.toLowerCase() === term) ||
      this.tokenTargets.some((token) => token.dataset.value.toLowerCase() === term)

    if (!this.createValue || exists) {
      this._createOption?.remove()
      this._createOption = null
      return
    }

    if (!this._createOption) {
      this._createOption = document.createElement("li")
      this._createOption.id = `${this.listboxTarget.id}-option-create`
      this._createOption.className = "l-ui-combobox__option l-ui-combobox__option--create"
      this._createOption.setAttribute("role", "option")
      this._createOption.setAttribute("aria-selected", "false")
      this._createOption.dataset.new = "true"
      this._createOption.dataset.action = "mousedown->l-ui--combobox#selectOption"
    }

    const raw = this.inputTarget.value.trim()
    this._createOption.dataset.value = raw
    this._createOption.dataset.label = raw
    this._createOption.textContent = `Add “${raw}”`
    // Before the empty row and the notice, which both talk about the list
    // rather than offering something to choose.
    this.listboxTarget.insertBefore(
      this._createOption,
      this.hasEmptyTarget ? this.emptyTarget : null
    )
  }

  _visibleOptions() {
    const options = this.optionTargets.filter((option) => !option.hidden)
    if (this._createOption) options.push(this._createOption)
    return options
  }

  _activeOption() {
    return this._activeId ? this.listboxTarget.querySelector(`#${CSS.escape(this._activeId)}`) : null
  }

  _moveActive(offset) {
    const options = this._visibleOptions()
    if (options.length === 0) return

    // With nothing highlighted yet, each arrow enters the list from its own
    // end: Down lands on the first option, Up on the last.
    const current = options.indexOf(this._activeOption())
    if (current === -1) {
      this._setActive(offset < 0 ? options[options.length - 1] : options[0])
      return
    }

    // The option after the last one of a partly loaded list is one that has not
    // been fetched yet, so it is fetched rather than wrapping round to the top.
    // The create option is exempt: it belongs to the term, not to the results.
    const active = options[current]
    if (offset > 0 && current === options.length - 1 && active !== this._createOption && this._hasMore) {
      this._loadMore({ highlightFirstNew: true })
      return
    }

    this._setActive(options[(current + offset + options.length) % options.length])
  }

  _setActive(option) {
    this.listboxTarget
      .querySelectorAll(".l-ui-combobox__option--active")
      .forEach((element) => element.classList.remove("l-ui-combobox__option--active"))

    if (!option) {
      this._activeId = null
      this.inputTarget.removeAttribute("aria-activedescendant")
      return
    }

    option.classList.add("l-ui-combobox__option--active")
    this._activeId = option.id
    this.inputTarget.setAttribute("aria-activedescendant", option.id)
    option.scrollIntoView({ block: "nearest" })
  }

  // Remote options

  get _term() {
    return this.inputTarget.value.trim()
  }

  get _belowThreshold() {
    return this.isRemote && this._term.length < this.minCharsValue
  }

  _scheduleSearch({ immediate = false } = {}) {
    clearTimeout(this._searchTimer)

    const term = this._term

    // Below the threshold there is nothing worth asking the server, so the list
    // says what it is waiting for instead of showing stale results.
    if (this._belowThreshold) {
      this._abort()
      this._loading = false
      this._loadingMore = false
      this._loadedTerm = null
      this._page = 0
      this._pages = 0
      this._renderOptions([], { replace: true })
      const characters = this.minCharsValue === 1 ? "character" : "characters"
      this._setNotice(`Type ${this.minCharsValue} ${characters} to search.`)
      return
    }

    if (immediate) {
      this._search(term)
    } else {
      this._searchTimer = setTimeout(() => this._search(term), SEARCH_DEBOUNCE)
    }
  }

  // Whether the loaded list stops short of the matches the server has.
  get _hasMore() {
    return this.isRemote && this._page > 0 && this._page < this._pages
  }

  async _search(term) {
    this._loading = true
    this._loadingMore = false
    this._refreshNotice()
    this._filterOptions()

    try {
      const { payload, current } = await this._fetchPage(term, 1)
      // A response that lost its race with a later one is not the answer to
      // what is now in the input, so it is dropped rather than rendered.
      if (!current) return

      this._loading = false
      this._loadedTerm = term
      this._takePageFrom(payload)
      this._renderOptions(payload.options, { replace: true })
      this._refreshNotice()
      this._filterOptions()

      const count = this.optionTargets.length
      if (term !== "") this._setActive(this._visibleOptions()[0] || null)
      this._announce(`${count} ${count === 1 ? "option" : "options"} available`)
    } catch (error) {
      if (error.name === "AbortError") return

      this._loading = false
      this._setNotice("The options could not be loaded.")
      this._filterOptions()
      this._announce("The options could not be loaded.")
    }
  }

  // Appends the page after the loaded one. Guarded so a scroll event, an arrow
  // key and the End key cannot each start their own fetch of the same page.
  async _loadMore({ highlightFirstNew = false } = {}) {
    if (!this._hasMore || this._loading || this._loadingMore) return

    const term = this._loadedTerm
    const page = this._page + 1

    this._loadingMore = true
    this._refreshNotice()

    try {
      const { payload, current } = await this._fetchPage(term, page)
      if (!current || this._loadedTerm !== term) return

      this._loadingMore = false
      this._takePageFrom(payload, page)
      const added = this._renderOptions(payload.options, { replace: false })
      this._refreshNotice()
      this._filterOptions()

      if (highlightFirstNew && added[0]) this._setActive(added[0])
      this._announce(
        `${added.length} more ${added.length === 1 ? "option" : "options"} loaded, ` +
          `${this.optionTargets.length} of ${this._count}`
      )
    } catch (error) {
      if (error.name === "AbortError") return

      this._loadingMore = false
      this._setNotice("More options could not be loaded.")
      this._announce("More options could not be loaded.")
    }
  }

  // Every request goes through here, so starting one always abandons the one
  // before it - a fresh search abandons a page fetch as readily as the reverse.
  async _fetchPage(term, page) {
    this._abort()

    const request = new AbortController()
    this._request = request

    const url = new URL(this.urlValue, window.location.href)
    url.searchParams.set("term", term)
    if (page > 1) url.searchParams.set("page", page)

    const response = await fetch(url, {
      signal: request.signal,
      headers: { Accept: "application/json" }
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

    const payload = await response.json()
    return { payload, current: request === this._request }
  }

  _takePageFrom(payload, fallbackPage = 1) {
    this._page = Number(payload.page) || fallbackPage
    this._pages = Number(payload.pages) || this._page
    this._count = Number(payload.count) || 0
  }

  _abort() {
    this._request?.abort()
    this._request = null
  }

  // Options are cloned from the template so fetched ones match server-rendered
  // ones exactly. Returns the elements added, so a caller can highlight them.
  _renderOptions(options, { replace }) {
    if (replace) {
      this.optionTargets.forEach((option) => option.remove())
      this._setActive(null)
      this._optionSequence = 0
      this.listboxTarget.scrollTop = 0
    }

    if (!this.hasOptionTemplateTarget) return []

    const selected = new Set(
      this.tokenTargets
        .filter((token) => token.dataset.new !== "true")
        .map((token) => token.dataset.value)
    )

    const fragment = document.createDocumentFragment()
    const added = (Array.isArray(options) ? options : []).map((option) => {
      const value = String(option.value)
      const label = String(option.label)
      const element = this.optionTemplateTarget.content.firstElementChild.cloneNode(true)

      element.id = `${this.listboxTarget.id}-option-${this._optionSequence++}`
      element.dataset.value = value
      element.dataset.label = label
      element.setAttribute("aria-selected", String(selected.has(value)))
      element.querySelector(".l-ui-combobox__option-label").textContent = label

      fragment.appendChild(element)
      return element
    })

    // Before the empty row and the notice, which are not options.
    this.listboxTarget.insertBefore(fragment, this._firstNonOption())
    return added
  }

  _firstNonOption() {
    return (
      this.listboxTarget.querySelector(
        ":scope > :not(.l-ui-combobox__option), :scope > .l-ui-combobox__option--create"
      ) || null
    )
  }

  // The notice is the list's progress line as well as its status line: while
  // pages remain it says how far in the list has got, since a list that grows
  // as it is scrolled otherwise gives no sense of how much there is.
  _refreshNotice() {
    if (this._loading) return this._setNotice("Searching…")
    if (this._loadingMore) return this._setNotice("Loading more…")
    if (this._belowThreshold) return

    const shown = this.optionTargets.length
    this._setNotice(this._hasMore ? `Showing ${shown} of ${this._count} matches.` : null)
  }

  _setNotice(message) {
    if (!this.hasNoticeTarget) return

    this.noticeTarget.textContent = message || ""
    this.noticeTarget.hidden = !message
  }

  _announce(message) {
    if (!this.hasStatusTarget) return
    this.statusTarget.textContent = message
  }
}
