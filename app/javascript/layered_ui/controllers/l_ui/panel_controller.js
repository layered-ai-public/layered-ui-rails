import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "hideButton", "actionButton", "resizeHandle"]

  // Initialize panel state from localStorage and set up resize handlers
  connect() {
    this.previousActiveElement = null
    this.updateWidth()

    const page = document.querySelector(".l-ui-page")
    if (page) page.style.transition = "none"
    this.containerTarget.style.transition = "none"

    let isOpen = false
    try { isOpen = localStorage.getItem("panelOpen") === "true" } catch (e) { /* localStorage unavailable */ }
    if (isOpen) {
      this.open(false) // Don't announce on initial load
    } else {
      this.close(false) // Don't announce on initial load
    }

    requestAnimationFrame(() => {
      if (page) page.style.transition = ""
      this.containerTarget.style.transition = ""
    })

    this.isResizing = false
    this.boundResize = this.resize.bind(this)
    this.boundStopResize = this.stopResize.bind(this)
    this.boundWindowResize = this.handleWindowResize.bind(this)
    this.boundKeyboardShortcut = this.handleKeyboardShortcut.bind(this)

    window.addEventListener('resize', this.boundWindowResize)
    document.addEventListener('keydown', this.boundKeyboardShortcut)
  }

  // Clean up event listeners and state
  disconnect() {
    clearTimeout(this.announceTimeout)
    window.removeEventListener('resize', this.boundWindowResize)
    document.removeEventListener('keydown', this.boundKeyboardShortcut)

    if (this.isResizing) {
      document.removeEventListener('mousemove', this.boundResize)
      document.removeEventListener('mouseup', this.boundStopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      this.isResizing = false
    }

    this.previousActiveElement = null
  }

  // Handle Escape key to close panel
  handleEscape(event) {
    if (event.key === "Escape" && this.containerTarget.classList.contains("open")) {
      this.close()
    }
  }

  // Handle CMD/CTRL+i keyboard shortcut to toggle panel
  handleKeyboardShortcut(event) {
    if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      const isOpen = this.containerTarget.classList.contains("open")
      if (isOpen) {
        this.close()
      } else {
        this.open()
      }
    }
  }

  // Toggle panel open/closed state
  toggle(event) {
    event.preventDefault()
    const isOpen = this.containerTarget.classList.contains("open")

    if (isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  // Open the panel
  open(announce = true) {
    // Store the currently focused element to restore focus later
    this.previousActiveElement = document.activeElement

    this.containerTarget.classList.add("open")
    this.actionButtonTarget.classList.add("hidden")

    // Update ARIA attributes
    this.containerTarget.setAttribute("aria-hidden", "false")
    this.containerTarget.removeAttribute("inert")
    this.actionButtonTarget.setAttribute("aria-expanded", "true")

    try { localStorage.setItem("panelOpen", "true") } catch (e) { /* localStorage unavailable */ }
    this.updatePageMargin()

    // Move focus to the close button inside the panel
    if (announce) {
      requestAnimationFrame(() => {
        if (this.hasHideButtonTarget) {
          this.hideButtonTarget.focus()
        }
      })
      this.announce("Panel opened")
    }
  }

  // Close the panel
  close(announce = true) {
    this.containerTarget.classList.remove("open")
    this.actionButtonTarget.classList.remove("hidden")

    // Update ARIA attributes
    this.containerTarget.setAttribute("aria-hidden", "true")
    this.containerTarget.setAttribute("inert", "")
    this.actionButtonTarget.setAttribute("aria-expanded", "false")

    try { localStorage.setItem("panelOpen", "false") } catch (e) { /* localStorage unavailable */ }
    this.updatePageMargin()

    // Restore focus to the element that opened the panel
    if (announce) {
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
        this.previousActiveElement.focus()
      } else if (this.hasActionButtonTarget) {
        this.actionButtonTarget.focus()
      }
      this.announce("Panel closed")
    }
  }

  // Handle keyboard navigation for resize handle
  handleResizeKeydown(event) {
    const step = event.shiftKey ? 50 : 10
    let newWidth = this.containerTarget.offsetWidth

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault()
        newWidth += step // Make panel wider (resize handle is on the left)
        break
      case "ArrowRight":
        event.preventDefault()
        newWidth -= step // Make panel narrower
        break
      case "Home":
        event.preventDefault()
        newWidth = this.getMaxWidth()
        break
      case "End":
        event.preventDefault()
        newWidth = 240 // Minimum width
        break
      default:
        return
    }

    const minWidth = 240
    const maxWidth = this.getMaxWidth()
    newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)

    this.containerTarget.style.width = `${newWidth}px`
    this.updatePageMargin()
    this.updateResizeHandleAria(newWidth)

    if (!this.isMobile()) {
      try { localStorage.setItem("panelWidth", `${newWidth}px`) } catch (e) { /* localStorage unavailable */ }
    }
  }

  // Get maximum panel width
  getMaxWidth() {
    const navigationWidth = this.hasNavigation() ? 240 : 0
    const minPageWidth = 240
    return window.innerWidth - navigationWidth - minPageWidth
  }

  // Update the resize handle's ARIA value
  updateResizeHandleAria(width) {
    if (this.hasResizeHandleTarget) {
      this.resizeHandleTarget.setAttribute("aria-valuenow", width)
      this.resizeHandleTarget.setAttribute("aria-valuemax", this.getMaxWidth())
    }
  }

  // Start resizing the panel
  startResize(event) {
    event.preventDefault()
    this.isResizing = true
    this.startX = event.clientX
    this.startWidth = this.containerTarget.offsetWidth

    document.addEventListener('mousemove', this.boundResize)
    document.addEventListener('mouseup', this.boundStopResize)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  // Resize the panel during drag
  resize(event) {
    if (!this.isResizing) return

    const deltaX = this.startX - event.clientX
    const minWidth = 240
    const maxWidth = this.getMaxWidth()

    const newWidth = Math.min(Math.max(this.startWidth + deltaX, minWidth), maxWidth)

    this.containerTarget.style.width = `${newWidth}px`
    this.updatePageMargin()
    this.updateResizeHandleAria(newWidth)
  }

  // Stop resizing and save the new width
  stopResize() {
    if (!this.isResizing) return

    this.isResizing = false
    document.removeEventListener('mousemove', this.boundResize)
    document.removeEventListener('mouseup', this.boundStopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    if (!this.isMobile()) {
      try { localStorage.setItem("panelWidth", this.containerTarget.style.width) } catch (e) { /* localStorage unavailable */ }
    }
  }

  // Reset panel width to default
  resetWidth(event) {
    event.preventDefault()
    if (this.isMobile()) {
      this.containerTarget.style.width = ''
    } else {
      this.containerTarget.style.width = '480px'
      try { localStorage.removeItem("panelWidth") } catch (e) { /* localStorage unavailable */ }
    }
    this.updatePageMargin()
    this.updateResizeHandleAria(480)
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

  // Check if the current viewport is mobile
  isMobile() {
    return window.innerWidth < 768
  }

  // Check if navigation is visible (desktop with navigation)
  hasNavigation() {
    const page = document.querySelector(".l-ui-page")
    return page && page.classList.contains("l-ui-page--with-navigation") && !this.isMobile()
  }

  // Update panel width based on device type and saved preferences
  updateWidth() {
    if (this.isMobile()) {
      this.containerTarget.style.width = ''
    } else {
      let savedWidth = null
      try { savedWidth = localStorage.getItem("panelWidth") } catch (e) { /* localStorage unavailable */ }
      if (savedWidth) {
        const minWidth = 240
        const maxWidth = this.getMaxWidth()
        const savedWidthValue = parseInt(savedWidth, 10)
        const constrainedWidth = Math.min(Math.max(savedWidthValue, minWidth), maxWidth)
        this.containerTarget.style.width = `${constrainedWidth}px`
        this.updateResizeHandleAria(constrainedWidth)
      }
    }
  }

  // Handle window resize events
  handleWindowResize() {
    this.updateWidth()
    this.updatePageMargin()
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
