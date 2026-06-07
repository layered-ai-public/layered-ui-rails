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
    // Apply the restored state without animating the chevron on load; it should
    // simply render in the correct position.
    const toggle = this.toggleTarget
    toggle.classList.add("l-ui-navigation__section-toggle--no-transition")
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false")
    if (isOpen) {
      this.panelTarget.removeAttribute("hidden")
    } else {
      this.panelTarget.setAttribute("hidden", "")
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toggle.classList.remove("l-ui-navigation__section-toggle--no-transition")
      })
    })
  }

  toggle() {
    const isOpen = this.toggleTarget.getAttribute("aria-expanded") !== "true"
    this.toggleTarget.setAttribute("aria-expanded", isOpen ? "true" : "false")
    if (isOpen) {
      this.panelTarget.removeAttribute("hidden")
      this.#animateOpen()
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

  // Slide the panel open by transitioning its height from 0 to its natural
  // height, only on user-initiated open, not on initial page load.
  #animateOpen() {
    const panel = this.panelTarget
    const CLASS = "l-ui-navigation__section-items--opening"

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const endHeight = panel.scrollHeight
    panel.classList.add(CLASS)
    panel.style.height = "0px"
    panel.offsetHeight // Force a reflow so the starting height is applied.
    panel.style.height = `${endHeight}px`

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height") return
      panel.classList.remove(CLASS)
      panel.style.height = ""
    }, { once: true })
  }
}
