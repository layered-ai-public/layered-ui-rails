import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "hideButton", "actionButton"]

  connect() {
    this.previousActiveElement = null
    this.boundKeyboardShortcut = this.handleKeyboardShortcut.bind(this)

    const page = document.querySelector(".l-ui-page")
    if (page) page.style.transition = "none"
    this.containerTarget.style.transition = "none"

    let isOpen = false
    try { isOpen = localStorage.getItem("panelOpen") === "true" } catch (e) { /* unavailable */ }
    if (isOpen) {
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
    clearTimeout(this.announceTimeout)
    document.removeEventListener('keydown', this.boundKeyboardShortcut)
    this.previousActiveElement = null
  }

  // Handle Escape key to close panel
  handleEscape() {
    if (this.containerTarget.classList.contains("open")) {
      this.close()
    }
  }

  // Handle CMD/CTRL+i keyboard shortcut to toggle panel
  handleKeyboardShortcut(event) {
    if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      if (this.containerTarget.classList.contains("open")) {
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

    if (this.containerTarget.classList.contains("open")) {
      this.close()
    } else {
      this.open()
    }
  }

  // Open the panel
  open(announce = true) {
    this.previousActiveElement = document.activeElement

    this.containerTarget.classList.add("open")

    if (this.hasActionButtonTarget) {
      this.actionButtonTarget.classList.add("hidden")
      this.actionButtonTarget.setAttribute("aria-expanded", "true")
    }

    this.containerTarget.setAttribute("aria-hidden", "false")
    this.containerTarget.removeAttribute("inert")

    // On mobile, prevent background content from being tabbable
    if (this.isMobile()) {
      const main = document.querySelector("main")
      if (main) main.setAttribute("inert", "")
    }

    try { localStorage.setItem("panelOpen", "true") } catch (e) { /* unavailable */ }
    this.updatePageMargin()

    if (announce) {
      requestAnimationFrame(() => {
        if (this.hasHideButtonTarget) this.hideButtonTarget.focus()
      })
      this.announce("Panel opened")
    }
  }

  // Close the panel
  close(announce = true) {
    this.containerTarget.classList.remove("open")

    if (this.hasActionButtonTarget) {
      this.actionButtonTarget.classList.remove("hidden")
      this.actionButtonTarget.setAttribute("aria-expanded", "false")
    }

    this.containerTarget.setAttribute("aria-hidden", "true")
    this.containerTarget.setAttribute("inert", "")

    const main = document.querySelector("main")
    if (main) main.removeAttribute("inert")

    try { localStorage.setItem("panelOpen", "false") } catch (e) { /* unavailable */ }
    this.updatePageMargin()

    if (announce) {
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
        this.previousActiveElement.focus()
      } else if (this.hasActionButtonTarget) {
        this.actionButtonTarget.focus()
      }
      this.announce("Panel closed")
    }
  }

  // Update the page margin to accommodate the open panel on desktop
  updatePageMargin() {
    const page = document.querySelector(".l-ui-page")
    if (!page) return

    const isOpen = this.containerTarget.classList.contains("open")
    if (isOpen && !this.isMobile()) {
      page.style.marginRight = `${this.containerTarget.offsetWidth}px`
    } else {
      page.style.marginRight = ""
    }
  }

  isMobile() {
    return window.innerWidth < 768
  }

  // Announce a message to screen readers via the live region
  announce(message) {
    const liveRegion = document.getElementById("l-ui-live-region")
    if (liveRegion) {
      liveRegion.textContent = message
      clearTimeout(this.announceTimeout)
      this.announceTimeout = setTimeout(() => {
        liveRegion.textContent = ""
      }, 3000)
    }
  }
}
