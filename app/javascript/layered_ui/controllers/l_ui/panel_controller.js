import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"
import { storageGet, storageSet } from "layered_ui/utilities/storage"
import { isMobile } from "layered_ui/utilities/layout"

export default class extends Controller {
  static targets = ["container", "hideButton", "actionButton"]

  connect() {
    this.previousActiveElement = null
    this.isOpen = false
    this.boundKeyboardShortcut = this.handleKeyboardShortcut.bind(this)
    const page = document.querySelector(".l-ui-page")
    if (page) page.style.transition = "none"
    this.containerTarget.style.transition = "none"

    if (storageGet("panelOpen") === "true") {
      this.open(false)
    } else {
      this.close(false)
    }

    requestAnimationFrame(() => {
      if (page) page.style.transition = ""
      this.containerTarget.style.transition = ""
    })

    document.addEventListener('keydown', this.boundKeyboardShortcut)
  }

  disconnect() {
    clearAnnounceTimeout(this)
    document.removeEventListener('keydown', this.boundKeyboardShortcut)
    this.previousActiveElement = null
  }

  // Handle Escape key to close panel
  handleEscape() {
    if (this.isOpen) {
      this.close()
    }
  }

  // Handle CMD/CTRL+i keyboard shortcut to toggle panel
  handleKeyboardShortcut(event) {
    if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    }
  }

  // Toggle panel open/closed state
  toggle(event) {
    if (this.hasActionButtonTarget && this.actionButtonTarget.dataset.dragging) return
    event.preventDefault()

    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  // Open the panel
  open(shouldAnnounce = true) {
    this.previousActiveElement = document.activeElement

    this.isOpen = true
    this.containerTarget.classList.add("open")

    if (this.hasActionButtonTarget) {
      this.actionButtonTarget.classList.add("hidden")
      this.actionButtonTarget.setAttribute("aria-expanded", "true")
      this.actionButtonTarget.setAttribute("aria-hidden", "true")
      this.actionButtonTarget.setAttribute("tabindex", "-1")
      this.actionButtonTarget.disabled = true
    }

    this.containerTarget.setAttribute("aria-hidden", "false")
    this.containerTarget.removeAttribute("inert")

    // On mobile, prevent background content from being tabbable and scrollable
    if (isMobile()) {
      const main = document.querySelector("main")
      if (main) main.setAttribute("inert", "")
      this.savedScrollY = window.scrollY
      document.body.style.top = `-${this.savedScrollY}px`
      document.body.classList.add("l-ui-scroll-lock")
    }

    storageSet("panelOpen", "true")
    this.updatePageMargin()

    if (shouldAnnounce) {
      requestAnimationFrame(() => {
        if (this.hasHideButtonTarget) this.hideButtonTarget.focus()
      })
      announce("Panel opened", this)
    }
  }

  // Close the panel
  close(shouldAnnounce = true) {
    this.isOpen = false
    this.containerTarget.classList.remove("open")

    if (this.hasActionButtonTarget) {
      this.actionButtonTarget.classList.remove("hidden")
      this.actionButtonTarget.disabled = false
      this.actionButtonTarget.setAttribute("aria-expanded", "false")
      this.actionButtonTarget.removeAttribute("aria-hidden")
      this.actionButtonTarget.setAttribute("tabindex", "-1")
    }

    this.containerTarget.setAttribute("aria-hidden", "true")
    this.containerTarget.setAttribute("inert", "")

    const main = document.querySelector("main")
    if (main) main.removeAttribute("inert")
    document.body.classList.remove("l-ui-scroll-lock")
    document.body.style.top = ""
    if (this.savedScrollY !== undefined) {
      window.scrollTo(0, this.savedScrollY)
    }

    storageSet("panelOpen", "false")
    this.updatePageMargin()

    if (shouldAnnounce) {
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
        this.previousActiveElement.focus()
      } else if (this.hasActionButtonTarget) {
        this.actionButtonTarget.focus()
      }
      announce("Panel closed", this)
    }
  }

  // Update the page margin to accommodate the open panel on desktop
  updatePageMargin() {
    const page = document.querySelector(".l-ui-page")
    if (!page) return

    if (this.isOpen && !isMobile()) {
      page.style.marginRight = `${this.containerTarget.offsetWidth}px`
    } else {
      page.style.marginRight = ""
    }
  }
}
