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

    // Button drag state
    this.isDragging = false
    this.dragStarted = false
    this.boundDragButton = this.dragButton.bind(this)
    this.boundStopButtonDrag = this.stopButtonDrag.bind(this)

    this.initButtonPosition()

    if (this.hasActionButtonTarget) {
      this.actionButtonTarget.addEventListener('mousedown', this.startButtonDrag.bind(this))
      this.actionButtonTarget.addEventListener('touchstart', this.startButtonDrag.bind(this), { passive: true })
    }

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

    if (this.dragStarted) {
      document.removeEventListener('mousemove', this.boundDragButton)
      document.removeEventListener('mouseup', this.boundStopButtonDrag)
      document.removeEventListener('touchmove', this.boundDragButton)
      document.removeEventListener('touchend', this.boundStopButtonDrag)
      document.body.style.userSelect = ''
      this.dragStarted = false
      this.isDragging = false
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
    if (this.isDragging) return
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
    this.constrainButtonPosition()
  }

  // Initialize button position from localStorage or default to bottom-right
  initButtonPosition() {
    if (!this.hasActionButtonTarget) return

    const btn = this.actionButtonTarget
    let position = null
    try {
      const saved = localStorage.getItem("panelButtonPosition")
      if (saved) position = JSON.parse(saved)
    } catch (e) { /* localStorage unavailable */ }

    if (position && position.edge && typeof position.top === "number") {
      const topPx = this.clampTop(position.top / 100 * window.innerHeight)
      btn.style.top = `${topPx}px`
      if (position.edge === "left") {
        btn.style.left = `${this.getLeftEdgePosition()}px`
        btn.style.right = "auto"
      } else {
        btn.style.right = `${this.getButtonPadding()}px`
        btn.style.left = "auto"
      }
    } else {
      this.applyDefaultButtonPosition()
    }
  }

  // Apply the default bottom-right position
  applyDefaultButtonPosition() {
    if (!this.hasActionButtonTarget) return
    const btn = this.actionButtonTarget
    const padding = this.isMobile() ? 16 : 32
    btn.style.right = `${padding}px`
    btn.style.left = "auto"
    btn.style.top = `${window.innerHeight - 56 - padding}px`
  }

  // Get the edge padding value based on viewport
  getButtonPadding() {
    return this.isMobile() ? 16 : 32
  }

  // Get the minimum left position, accounting for the navigation sidebar
  getLeftEdgePosition() {
    const padding = this.getButtonPadding()
    const navWidth = this.hasNavigation() ? 240 : 0
    return navWidth + padding
  }

  // Clamp a top value so the button stays within the viewport, below the header
  clampTop(topPx) {
    const padding = this.getButtonPadding()
    const minTop = 63 + padding // 63 = header height (--header-height)
    const maxTop = window.innerHeight - 56 - padding // 56 = button height (h-14 = 3.5rem)
    return Math.min(Math.max(topPx, minTop), maxTop)
  }

  // Get pointer coordinates from mouse or touch event
  getPointerPosition(event) {
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }
    if (event.changedTouches && event.changedTouches.length > 0) {
      return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
    }
    return { x: event.clientX, y: event.clientY }
  }

  // Start tracking a potential drag on the panel button
  startButtonDrag(event) {
    if (!this.hasActionButtonTarget) return

    const pos = this.getPointerPosition(event)
    const rect = this.actionButtonTarget.getBoundingClientRect()

    this.dragStartX = pos.x
    this.dragStartY = pos.y
    this.buttonStartX = rect.left
    this.buttonStartY = rect.top
    this.isDragging = false
    this.dragStarted = true

    document.addEventListener('mousemove', this.boundDragButton)
    document.addEventListener('mouseup', this.boundStopButtonDrag)
    document.addEventListener('touchmove', this.boundDragButton, { passive: false })
    document.addEventListener('touchend', this.boundStopButtonDrag)
    document.body.style.userSelect = 'none'
  }

  // Handle pointer movement during button drag
  dragButton(event) {
    if (!this.dragStarted) return

    const pos = this.getPointerPosition(event)
    const deltaX = pos.x - this.dragStartX
    const deltaY = pos.y - this.dragStartY

    // Only enter drag mode after exceeding 5px threshold
    if (!this.isDragging) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return
      this.isDragging = true
      this.actionButtonTarget.classList.add("l-ui-panel__button--dragging")
    }

    event.preventDefault()

    const padding = this.getButtonPadding()
    const minLeft = this.getLeftEdgePosition()
    const newLeft = Math.max(minLeft, Math.min(this.buttonStartX + deltaX, window.innerWidth - 56 - padding))
    const newTop = this.clampTop(this.buttonStartY + deltaY)

    const btn = this.actionButtonTarget
    btn.style.left = `${newLeft}px`
    btn.style.right = "auto"
    btn.style.top = `${newTop}px`
  }

  // Finish button drag - snap to nearest edge and save position
  stopButtonDrag(event) {
    if (!this.dragStarted) return

    document.removeEventListener('mousemove', this.boundDragButton)
    document.removeEventListener('mouseup', this.boundStopButtonDrag)
    document.removeEventListener('touchmove', this.boundDragButton)
    document.removeEventListener('touchend', this.boundStopButtonDrag)
    document.body.style.userSelect = ''

    if (this.isDragging) {
      event.preventDefault()

      const btn = this.actionButtonTarget
      const rect = btn.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const padding = this.getButtonPadding()
      const leftEdge = this.getLeftEdgePosition()
      const availableLeft = leftEdge + 28 // centre of button at left edge
      const availableRight = window.innerWidth - padding - 28 // centre of button at right edge
      const midpoint = (availableLeft + availableRight) / 2
      const edge = centerX < midpoint ? "left" : "right"

      // Snap to edge with animation
      btn.classList.remove("l-ui-panel__button--dragging")
      btn.classList.add("l-ui-panel__button--snapping")

      if (edge === "left") {
        btn.style.left = `${leftEdge}px`
        btn.style.right = "auto"
      } else {
        btn.style.right = `${padding}px`
        btn.style.left = "auto"
      }

      const topPercent = rect.top / window.innerHeight * 100

      try {
        localStorage.setItem("panelButtonPosition", JSON.stringify({ edge, top: topPercent }))
      } catch (e) { /* localStorage unavailable */ }

      const onTransitionEnd = () => {
        btn.classList.remove("l-ui-panel__button--snapping")
        btn.removeEventListener("transitionend", onTransitionEnd)
      }
      btn.addEventListener("transitionend", onTransitionEnd)

      // Fallback in case transitionend doesn't fire
      setTimeout(() => {
        btn.classList.remove("l-ui-panel__button--snapping")
        btn.removeEventListener("transitionend", onTransitionEnd)
      }, 400)

      // Suppress the click event that follows mouseup
      const suppressClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        btn.removeEventListener("click", suppressClick, true)
      }
      btn.addEventListener("click", suppressClick, true)
    }

    this.dragStarted = false
    // isDragging is reset after a microtask so toggle() guard still catches it
    setTimeout(() => { this.isDragging = false }, 0)
  }

  // Constrain button position to viewport bounds after resize
  constrainButtonPosition() {
    if (!this.hasActionButtonTarget) return

    const btn = this.actionButtonTarget
    // Only constrain if position has been set (has inline top style)
    if (!btn.style.top) return

    const topPx = this.clampTop(parseFloat(btn.style.top))
    btn.style.top = `${topPx}px`

    const padding = this.getButtonPadding()
    const leftEdge = this.getLeftEdgePosition()
    // Re-snap to correct edge padding (mobile/desktop may differ after resize)
    if (btn.style.right && btn.style.right !== "auto") {
      btn.style.right = `${padding}px`
    } else if (btn.style.left && btn.style.left !== "auto") {
      const leftPx = parseFloat(btn.style.left)
      // If button would be off-screen on the right, snap it back
      if (leftPx + 56 + padding > window.innerWidth) {
        btn.style.right = `${padding}px`
        btn.style.left = "auto"
      } else {
        btn.style.left = `${Math.max(leftEdge, leftPx)}px`
      }
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
