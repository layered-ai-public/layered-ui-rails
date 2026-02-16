import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["tab", "panel"]

  connect() {
    // Ensure initial state is consistent with the active tab
    const activeTab = this.tabTargets.find(tab =>
      tab.classList.contains("l-ui-tabs__tab--active")
    )
    if (activeTab) {
      this.activateTab(activeTab, false)
    }
  }

  // Handle tab click
  select(event) {
    this.activateTab(event.currentTarget, true)
  }

  // Handle keyboard navigation on the tablist
  keydown(event) {
    const tabs = this.tabTargets
    const currentIndex = tabs.indexOf(event.currentTarget)

    let targetIndex

    switch (event.key) {
      case "ArrowRight":
        targetIndex = (currentIndex + 1) % tabs.length
        break
      case "ArrowLeft":
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length
        break
      case "Home":
        targetIndex = 0
        break
      case "End":
        targetIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    tabs[targetIndex].focus()
    this.activateTab(tabs[targetIndex], true)
  }

  disconnect() {
    clearTimeout(this.announceTimeout)
  }

  // Private

  activateTab(selectedTab, shouldAnnounce) {
    this.tabTargets.forEach((tab, index) => {
      const panel = this.panelTargets[index]
      const isSelected = tab === selectedTab

      // Swap classes
      tab.classList.toggle("l-ui-tabs__tab--active", isSelected)
      tab.classList.toggle("l-ui-tabs__tab", !isSelected)

      // Update ARIA
      tab.setAttribute("aria-selected", isSelected)
      tab.setAttribute("tabindex", isSelected ? "0" : "-1")

      // Show/hide panel
      if (panel) {
        panel.hidden = !isSelected
      }
    })

    if (shouldAnnounce) {
      this.announce(`${selectedTab.textContent.trim()} tab selected`)
    }
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
