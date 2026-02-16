import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["navigation", "backdrop", "toggleButton", "openIcon", "closeIcon"]

  connect() {
    this.previousActiveElement = null
  }

  toggle(event) {
    event.stopPropagation()
    const isOpen = this.navigationTarget.classList.contains("open")

    if (isOpen) {
      this.closeNavigation()
    } else {
      this.openNavigation()
    }
  }

  close(event) {
    // Close menu when clicking outside on mobile or pressing Escape
    if (event.type === "keydown" && event.key !== "Escape") return

    if (this.hasNavigationTarget && this.navigationTarget.classList.contains("open")) {
      // For click events, check if clicking outside
      if (event.type === "click" && this.navigationTarget.contains(event.target)) return

      this.closeNavigation()
    }
  }

  openNavigation() {
    // Store the currently focused element to restore focus later
    this.previousActiveElement = document.activeElement

    this.navigationTarget.classList.add("open")
    this.backdropTarget.classList.add("open")

    // Update ARIA attributes and swap icons
    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", "true")
    }
    if (this.hasOpenIconTarget) this.openIconTarget.style.display = "none"
    if (this.hasCloseIconTarget) this.closeIconTarget.style.display = ""

    // Move focus to the first focusable element in the navigation
    requestAnimationFrame(() => {
      const firstFocusable = this.navigationTarget.querySelector(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
    })

    // Announce to screen readers
    this.announce("Navigation menu opened")
  }

  closeNavigation() {
    this.navigationTarget.classList.remove("open")
    this.backdropTarget.classList.remove("open")

    // Update ARIA attributes and swap icons
    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", "false")
    }
    if (this.hasOpenIconTarget) this.openIconTarget.style.display = ""
    if (this.hasCloseIconTarget) this.closeIconTarget.style.display = "none"

    // Restore focus to the element that opened the navigation
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
      this.previousActiveElement.focus()
    }

    // Announce to screen readers
    this.announce("Navigation menu closed")
  }

  disconnect() {
    clearTimeout(this.announceTimeout)
    this.previousActiveElement = null
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
