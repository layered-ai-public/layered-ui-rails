import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dialog"]

  // Track how many modals have locked scroll so nested modals don't unlock prematurely
  static openCount = 0

  connect() {
    this.previousActiveElement = null
  }

  // Open the modal
  open() {
    // Store the currently focused element to restore focus later
    this.previousActiveElement = document.activeElement

    this.constructor.openCount++
    document.body.style.overflow = "hidden"
    this.dialogTarget.showModal()

    // Move focus to the first focusable element inside the dialog
    requestAnimationFrame(() => {
      const firstFocusable = this.dialogTarget.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
    })

    // Announce to screen readers
    this.announce("Dialog opened")
  }

  // Close the modal
  close() {
    this.constructor.openCount = Math.max(0, this.constructor.openCount - 1)
    if (this.constructor.openCount === 0) {
      document.body.style.overflow = ""
    }
    this.dialogTarget.close()

    // Restore focus to the element that opened the modal
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
      this.previousActiveElement.focus()
    }

    // Announce to screen readers
    this.announce("Dialog closed")
  }

  // Close the modal when clicking outside the dialog
  closeOnBackdrop(event) {
    if (event.target === this.dialogTarget) {
      this.close()
    }
  }

  // Handle the close event on the dialog
  dialogTargetConnected(element) {
    this._closeHandler = () => {
      this.constructor.openCount = Math.max(0, this.constructor.openCount - 1)
      if (this.constructor.openCount === 0) {
        document.body.style.overflow = ""
      }
      // Restore focus when dialog is closed via Escape key
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
        this.previousActiveElement.focus()
      }
      this.announce("Dialog closed")
    }
    element.addEventListener("close", this._closeHandler)
  }

  // Remove the close event listener on the dialog
  dialogTargetDisconnected(element) {
    element.removeEventListener("close", this._closeHandler)
  }

  disconnect() {
    clearTimeout(this.announceTimeout)
    this.constructor.openCount = Math.max(0, this.constructor.openCount - 1)
    if (this.constructor.openCount === 0) {
      document.body.style.overflow = ""
    }
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
