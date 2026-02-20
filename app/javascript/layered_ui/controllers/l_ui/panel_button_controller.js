import { Controller } from "@hotwired/stimulus"

const HEADER_HEIGHT = 63
const BUTTON_SIZE = 56
const NAV_WIDTH = 240
const DRAG_THRESHOLD = 5
const SNAP_TIMEOUT = 400

export default class extends Controller {
  connect() {
    this.isDragging = false
    this.dragStarted = false
    this.boundDrag = this.drag.bind(this)
    this.boundStopDrag = this.stopDrag.bind(this)
    this.boundWindowResize = this.constrainPosition.bind(this)

    this.restorePosition()
    window.addEventListener('resize', this.boundWindowResize)
  }

  disconnect() {
    window.removeEventListener('resize', this.boundWindowResize)

    if (this.dragStarted) {
      document.removeEventListener('mousemove', this.boundDrag)
      document.removeEventListener('mouseup', this.boundStopDrag)
      document.removeEventListener('touchmove', this.boundDrag)
      document.removeEventListener('touchend', this.boundStopDrag)
      document.body.style.userSelect = ''
      this.dragStarted = false
      this.isDragging = false
    }
  }

  // Restore position from localStorage or apply default
  restorePosition() {
    let position = null
    try {
      const saved = localStorage.getItem("panelButtonPosition")
      if (saved) position = JSON.parse(saved)
    } catch (e) { /* unavailable */ }

    if (position && position.edge && typeof position.top === "number") {
      const topPx = this.clampTop(position.top / 100 * window.innerHeight)
      this.element.style.top = `${topPx}px`
      if (position.edge === "left") {
        this.element.style.left = `${this.getLeftEdge()}px`
        this.element.style.right = "auto"
      } else {
        this.element.style.right = `${this.getPadding()}px`
        this.element.style.left = "auto"
      }
    } else {
      this.applyDefault()
    }
  }

  // Apply the default bottom-right position
  applyDefault() {
    const padding = this.getPadding()
    this.element.style.right = `${padding}px`
    this.element.style.left = "auto"
    this.element.style.top = `${window.innerHeight - BUTTON_SIZE - padding}px`
  }

  // Start tracking a potential drag
  startDrag(event) {
    const pos = this.getPointerPosition(event)
    const rect = this.element.getBoundingClientRect()

    this.dragStartX = pos.x
    this.dragStartY = pos.y
    this.buttonStartX = rect.left
    this.buttonStartY = rect.top
    this.isDragging = false
    this.dragStarted = true

    document.addEventListener('mousemove', this.boundDrag)
    document.addEventListener('mouseup', this.boundStopDrag)
    document.addEventListener('touchmove', this.boundDrag, { passive: false })
    document.addEventListener('touchend', this.boundStopDrag)
    document.body.style.userSelect = 'none'
  }

  // Handle pointer movement during drag
  drag(event) {
    if (!this.dragStarted) return

    const pos = this.getPointerPosition(event)
    const deltaX = pos.x - this.dragStartX
    const deltaY = pos.y - this.dragStartY

    // Only enter drag mode after exceeding threshold
    if (!this.isDragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) return
      this.isDragging = true
      this.element.dataset.dragging = "true"
      this.element.classList.add("l-ui-panel__button--dragging")
    }

    event.preventDefault()

    const padding = this.getPadding()
    const minLeft = this.getLeftEdge()
    const newLeft = Math.max(minLeft, Math.min(this.buttonStartX + deltaX, window.innerWidth - BUTTON_SIZE - padding))
    const newTop = this.clampTop(this.buttonStartY + deltaY)

    this.element.style.left = `${newLeft}px`
    this.element.style.right = "auto"
    this.element.style.top = `${newTop}px`
  }

  // Finish drag - snap to nearest edge and save position
  stopDrag(event) {
    if (!this.dragStarted) return

    document.removeEventListener('mousemove', this.boundDrag)
    document.removeEventListener('mouseup', this.boundStopDrag)
    document.removeEventListener('touchmove', this.boundDrag)
    document.removeEventListener('touchend', this.boundStopDrag)
    document.body.style.userSelect = ''

    if (this.isDragging) {
      event.preventDefault()

      const rect = this.element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const padding = this.getPadding()
      const leftEdge = this.getLeftEdge()
      const availableLeft = leftEdge + BUTTON_SIZE / 2
      const availableRight = window.innerWidth - padding - BUTTON_SIZE / 2
      const midpoint = (availableLeft + availableRight) / 2
      const edge = centerX < midpoint ? "left" : "right"

      // Snap to edge with animation
      this.element.classList.remove("l-ui-panel__button--dragging")
      this.element.classList.add("l-ui-panel__button--snapping")

      const targetLeft = edge === "left"
        ? leftEdge
        : window.innerWidth - BUTTON_SIZE - padding

      this.element.style.left = `${targetLeft}px`
      this.element.style.right = "auto"

      const topPercent = rect.top / window.innerHeight * 100

      try {
        localStorage.setItem("panelButtonPosition", JSON.stringify({ edge, top: topPercent }))
      } catch (e) { /* unavailable */ }

      const onTransitionEnd = () => {
        this.element.classList.remove("l-ui-panel__button--snapping")
        this.element.removeEventListener("transitionend", onTransitionEnd)

        // After animation, switch right-edge buttons to right-based positioning
        // so they stay anchored correctly on window resize
        if (edge === "right") {
          this.element.style.right = `${padding}px`
          this.element.style.left = "auto"
        }
      }
      this.element.addEventListener("transitionend", onTransitionEnd)

      // Fallback in case transitionend doesn't fire
      setTimeout(() => {
        this.element.classList.remove("l-ui-panel__button--snapping")
        this.element.removeEventListener("transitionend", onTransitionEnd)
        if (edge === "right") {
          this.element.style.right = `${padding}px`
          this.element.style.left = "auto"
        }
      }, SNAP_TIMEOUT)

      // Suppress the click event that follows mouseup
      const suppressClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.element.removeEventListener("click", suppressClick, true)
      }
      this.element.addEventListener("click", suppressClick, true)
    }

    this.dragStarted = false
    // isDragging is reset after a microtask so the panel's toggle() guard still catches it
    setTimeout(() => {
      this.isDragging = false
      delete this.element.dataset.dragging
    }, 0)
  }

  // Constrain position to viewport bounds after resize
  constrainPosition() {
    if (!this.element.style.top) return

    const topPx = this.clampTop(parseFloat(this.element.style.top))
    this.element.style.top = `${topPx}px`

    const padding = this.getPadding()
    const leftEdge = this.getLeftEdge()

    if (this.element.style.right && this.element.style.right !== "auto") {
      this.element.style.right = `${padding}px`
    } else if (this.element.style.left && this.element.style.left !== "auto") {
      const leftPx = parseFloat(this.element.style.left)
      if (leftPx + BUTTON_SIZE + padding > window.innerWidth) {
        this.element.style.right = `${padding}px`
        this.element.style.left = "auto"
      } else {
        this.element.style.left = `${Math.max(leftEdge, leftPx)}px`
      }
    }
  }

  // Clamp a top value within viewport bounds, below the header
  clampTop(topPx) {
    const padding = this.getPadding()
    const minTop = HEADER_HEIGHT + padding
    const maxTop = window.innerHeight - BUTTON_SIZE - padding
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

  getPadding() {
    return this.isMobile() ? 16 : 32
  }

  getLeftEdge() {
    const navWidth = this.hasNavigation() ? NAV_WIDTH : 0
    return navWidth + this.getPadding()
  }

  isMobile() {
    return window.innerWidth < 768
  }

  hasNavigation() {
    const page = document.querySelector(".l-ui-page")
    return page && page.classList.contains("l-ui-page--with-navigation") && !this.isMobile()
  }
}
