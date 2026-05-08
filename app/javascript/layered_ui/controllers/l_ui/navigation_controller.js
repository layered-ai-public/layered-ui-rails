import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"
import { isMobile } from "layered_ui/utilities/layout"
import { lockBodyScroll, unlockBodyScroll } from "layered_ui/utilities/scroll_lock"

export default class extends Controller {
  static targets = ["navigation", "backdrop", "toggleButton", "openIcon", "closeIcon"]

  connect() {
    this.previousActiveElement = null
    this.isOpen = false
    this.isScrollLocked = false
    this._resizeFrame = null
    this.boundHandleResize = () => {
      if (this._resizeFrame) return
      this._resizeFrame = requestAnimationFrame(() => {
        this._resizeFrame = null
        this.handleResize()
      })
    }
    window.addEventListener("resize", this.boundHandleResize)
    this.handleResize()
  }

  toggle(event) {
    if (!this.hasNavigationTarget) return

    event.stopPropagation()

    if (this.isOpen) {
      this.closeNavigation()
    } else {
      this.openNavigation()
    }
  }

  close(event) {
    // Close menu when clicking outside or pressing Escape
    if (event.type === "keydown" && event.key !== "Escape") return

    if (this.hasNavigationTarget && this.isOpen) {
      // For click events, check if clicking outside
      if (event.type === "click" && this.navigationTarget.contains(event.target)) return

      this.closeNavigation()
    }
  }

  openNavigation() {
    if (!this.hasNavigationTarget) return

    // Store the currently focused element to restore focus later
    this.previousActiveElement = document.activeElement

    this.isOpen = true
    this.navigationTarget.classList.add("open")
    this.backdropTarget.classList.add("open")
    this.setNavigationInteractivity(true)
    this.updateScrollLock()

    // Update ARIA attributes and swap icons
    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", "true")
    }
    if (this.hasOpenIconTarget) this.openIconTarget.style.display = "none"
    if (this.hasCloseIconTarget) this.closeIconTarget.style.display = ""

    // Prevent background content from being tabbable
    const main = document.querySelector("main")
    const panel = document.querySelector(".l-ui-panel-container")
    if (main) main.setAttribute("inert", "")
    if (panel) panel.setAttribute("inert", "")

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
    announce("Navigation menu opened", this)
  }

  closeNavigation() {
    if (!this.hasNavigationTarget) return

    this.isOpen = false
    this.navigationTarget.classList.remove("open")
    this.backdropTarget.classList.remove("open")
    this.setNavigationInteractivity(false)
    this.unlockScroll()

    // Update ARIA attributes and swap icons
    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", "false")
    }
    if (this.hasOpenIconTarget) this.openIconTarget.style.display = ""
    if (this.hasCloseIconTarget) this.closeIconTarget.style.display = "none"

    // Restore background content tabbability
    const main = document.querySelector("main")
    const panel = document.querySelector(".l-ui-panel-container")
    if (main) main.removeAttribute("inert")
    if (panel) panel.removeAttribute("inert")

    // Restore focus to the element that opened the navigation
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
      this.previousActiveElement.focus()
    }

    // Announce to screen readers
    announce("Navigation menu closed", this)
  }

  disconnect() {
    clearAnnounceTimeout(this)
    cancelAnimationFrame(this._resizeFrame)
    window.removeEventListener("resize", this.boundHandleResize)
    this.unlockScroll()
    this.previousActiveElement = null
  }

  handleResize() {
    if (!this.hasNavigationTarget) return

    // In overlay mode (default), always respect isOpen state regardless of viewport
    if (isMobile() || !this.alwaysShow) {
      this.setNavigationInteractivity(this.isOpen)
      this.updateScrollLock()
      return
    }

    // Desktop in always-show mode: force nav visible
    this.isOpen = false
    this.navigationTarget.classList.remove("open")
    this.backdropTarget.classList.remove("open")
    this.setNavigationInteractivity(true)
    this.unlockScroll()

    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", "false")
    }
    if (this.hasOpenIconTarget) this.openIconTarget.style.display = ""
    if (this.hasCloseIconTarget) this.closeIconTarget.style.display = "none"

    const main = document.querySelector("main")
    const panel = document.querySelector(".l-ui-panel-container")
    if (main) main.removeAttribute("inert")
    if (panel) panel.removeAttribute("inert")
  }

  setNavigationInteractivity(isOpen) {
    if (!this.alwaysShow && !isOpen) {
      this.navigationTarget.setAttribute("inert", "")
      this.navigationTarget.setAttribute("aria-hidden", "true")
      return
    }

    this.navigationTarget.removeAttribute("inert")
    this.navigationTarget.removeAttribute("aria-hidden")
  }

  updateScrollLock() {
    if (this.isOpen && isMobile()) {
      this.lockScroll()
    } else {
      this.unlockScroll()
    }
  }

  lockScroll() {
    if (this.isScrollLocked) return

    lockBodyScroll()
    this.isScrollLocked = true
  }

  unlockScroll() {
    if (!this.isScrollLocked) return

    unlockBodyScroll()
    this.isScrollLocked = false
  }

  get alwaysShow() {
    return this.element.classList.contains("l-ui-body--always-show-navigation")
  }
}
