import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"

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
    announce("Dialog opened", this)
  }

  // Close the modal - cleanup handled by the close event listener
  close() {
    this.dialogTarget.close()
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
      // Restore focus when dialog is closed
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
        this.previousActiveElement.focus()
      }
      announce("Dialog closed", this)
    }
    element.addEventListener("close", this._closeHandler)
  }

  // Remove the close event listener on the dialog
  dialogTargetDisconnected(element) {
    element.removeEventListener("close", this._closeHandler)
  }

  disconnect() {
    clearAnnounceTimeout(this)
    this.constructor.openCount = Math.max(0, this.constructor.openCount - 1)
    if (this.constructor.openCount === 0) {
      document.body.style.overflow = ""
    }
    this.previousActiveElement = null
  }
}
