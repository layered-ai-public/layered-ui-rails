import { Controller } from "@hotwired/stimulus"

const STORAGE_PREFIX = "l-ui-navigation-section:"

export default class extends Controller {
  static targets = ["toggle", "panel"]
  static values = {
    storageKey: String,
    forceOpen: Boolean
  }

  connect() {
    if (this.forceOpenValue) return
    if (!this.hasStorageKeyValue || !this.storageKeyValue) return
    let stored
    try {
      stored = window.localStorage.getItem(STORAGE_PREFIX + this.storageKeyValue)
    } catch (_e) {
      return
    }
    if (stored === null) return

    const isOpen = stored === "true"
    this.toggleTarget.setAttribute("aria-expanded", isOpen ? "true" : "false")
    if (isOpen) {
      this.panelTarget.removeAttribute("hidden")
    } else {
      this.panelTarget.setAttribute("hidden", "")
    }
  }

  toggle() {
    const isOpen = this.toggleTarget.getAttribute("aria-expanded") !== "true"
    this.toggleTarget.setAttribute("aria-expanded", isOpen ? "true" : "false")
    if (isOpen) {
      this.panelTarget.removeAttribute("hidden")
    } else {
      this.panelTarget.setAttribute("hidden", "")
    }

    if (!this.hasStorageKeyValue || !this.storageKeyValue) return
    try {
      window.localStorage.setItem(STORAGE_PREFIX + this.storageKeyValue, isOpen ? "true" : "false")
    } catch (_e) {
      // ignore
    }
  }
}
