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
// Each selection carries its own hidden input, so the control submits with a
// normal form post. Values that exist in the collection post under `name`;
// created values post under `createName`, keeping record IDs and free text
// unambiguous server-side.
export default class extends Controller {
  static targets = ["control", "tokens", "token", "input", "listbox", "option", "empty", "template", "status"]

  static values = {
    multiple: { type: Boolean, default: true },
    create: { type: Boolean, default: false },
    reorder: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    name: String,
    createName: String
  }

  connect() {
    this._activeId = null
    this._dragging = null
    this._dragOrigin = null
    this._dropped = false
    this._refreshMoveControls()
  }

  // Clicking anywhere in the control (the padding around the tokens, say)
  // behaves like clicking the input, matching a native text field.
  focusInput(event) {
    if (event.target.closest("button")) return
    this.inputTarget.focus()
  }

  open() {
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

  filter() {
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
      case "ArrowUp":
        event.preventDefault()
        if (this.isOpen) this._moveActive(-1)
        break
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

    this.optionTargets.forEach((option) => {
      option.hidden = term !== "" && !option.dataset.label.toLowerCase().includes(term)
    })

    this._refreshCreateOption(term)

    if (this.hasEmptyTarget) {
      this.emptyTarget.hidden = this._visibleOptions().length > 0
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
    this.listboxTarget.appendChild(this._createOption)
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

    const current = options.indexOf(this._activeOption())
    const next = current === -1 ? 0 : (current + offset + options.length) % options.length
    this._setActive(options[next])
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

  _announce(message) {
    if (!this.hasStatusTarget) return
    this.statusTarget.textContent = message
  }
}
