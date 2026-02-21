import { Controller } from "@hotwired/stimulus"
import { announce, clearAnnounceTimeout } from "layered_ui/utilities/announce"
import { storageGet, storageSet } from "layered_ui/utilities/storage"

export default class extends Controller {
  static targets = ["button"]

  // Set the theme based on the system preference or saved preference
  connect() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const saved = storageGet("theme")

    const isDark = saved ? saved === "dark" : prefersDark
    document.documentElement.classList.toggle("dark", isDark)

    // Set initial aria-pressed state
    this.updateAriaPressed(isDark)
  }

  // Toggle the theme between light and dark
  toggle() {
    const isDark = document.documentElement.classList.toggle("dark")
    storageSet("theme", isDark ? "dark" : "light")

    // Update aria-pressed state
    this.updateAriaPressed(isDark)

    // Announce theme change to screen readers
    announce(isDark ? "Dark mode enabled" : "Light mode enabled", this)
  }

  // Update the aria-pressed attribute on the toggle button
  updateAriaPressed(isDark) {
    if (this.hasButtonTarget) {
      this.buttonTarget.setAttribute("aria-pressed", isDark ? "true" : "false")
    }
  }

  disconnect() {
    clearAnnounceTimeout(this)
  }
}
