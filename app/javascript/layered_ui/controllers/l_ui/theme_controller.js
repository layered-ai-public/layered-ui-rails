import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button"]

  // Set the theme based on the system preference or saved preference
  connect() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    let saved = null
    try { saved = localStorage.getItem("theme") } catch (e) { /* localStorage unavailable */ }

    const isDark = saved ? saved === "dark" : prefersDark
    document.documentElement.classList.toggle("dark", isDark)

    // Set initial aria-pressed state
    this.updateAriaPressed(isDark)
  }

  // Toggle the theme between light and dark
  toggle() {
    const isDark = document.documentElement.classList.toggle("dark")
    const next = isDark ? "dark" : "light"
    try { localStorage.setItem("theme", next) } catch (e) { /* localStorage unavailable */ }

    // Update aria-pressed state
    this.updateAriaPressed(isDark)

    // Announce theme change to screen readers
    this.announce(isDark ? "Dark mode enabled" : "Light mode enabled")
  }

  // Update the aria-pressed attribute on the toggle button
  updateAriaPressed(isDark) {
    if (this.hasButtonTarget) {
      this.buttonTarget.setAttribute("aria-pressed", isDark ? "true" : "false")
    }
  }

  disconnect() {
    clearTimeout(this.announceTimeout)
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
