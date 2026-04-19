import { Controller } from "@hotwired/stimulus"
import { storageGetJSON, storageSet } from "layered_ui/utilities/storage"
import { getHeaderHeight, getPadding, getLeftEdge } from "layered_ui/utilities/layout"

const BUTTON_SIZE = 56
const DRAG_THRESHOLD = 5
const SNAP_TIMEOUT = 400
const TOP_LEFT = "top-left"
const TOP_RIGHT = "top-right"
const BOTTOM_LEFT = "bottom-left"
const BOTTOM_RIGHT = "bottom-right"
export default class extends Controller {
  connect() {
    this.isDragging = false
    this.dragStarted = false
    this.boundDrag = this.drag.bind(this)
    this.boundStopDrag = this.stopDrag.bind(this)
    this._resizeFrame = null
    this.boundWindowResize = () => {
      if (this._resizeFrame) return
      this._resizeFrame = requestAnimationFrame(() => {
        this._resizeFrame = null
        this.constrainPosition()
      })
    }
    this.boundKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this)

    this.restorePosition()
    window.addEventListener('resize', this.boundWindowResize)
    document.addEventListener('keydown', this.boundKeyboardShortcuts)
  }

  disconnect() {
    cancelAnimationFrame(this._resizeFrame)
    window.removeEventListener('resize', this.boundWindowResize)
    document.removeEventListener('keydown', this.boundKeyboardShortcuts)

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
    const position = storageGetJSON("panelButtonPosition")

    if (position && position.edge && typeof position.top === "number") {
      const topPx = this.clampTop(position.top / 100 * window.innerHeight)
      this.element.style.top = `${topPx}px`
      if (position.edge === "left") {
        this.element.style.left = `${getLeftEdge()}px`
        this.element.style.right = "auto"
      } else {
        this.element.style.right = `${getPadding()}px`
        this.element.style.left = "auto"
      }
    } else {
      this.applyDefault()
    }
  }

  toggle() {
    this.dispatch("toggle", { bubbles: true })
  }

  currentCorner() {
    const topPx = this.element.style.top
      ? parseFloat(this.element.style.top)
      : this.element.getBoundingClientRect().top

    const topEdge = this.clampTop(getHeaderHeight() + getPadding())
    const bottomEdge = this.clampTop(window.innerHeight - BUTTON_SIZE - getPadding())
    const midY = (topEdge + bottomEdge) / 2
    const isTop = topPx <= midY

    const isRight = this.element.style.right && this.element.style.right !== "auto"
    if (isTop && isRight) return TOP_RIGHT
    if (!isTop && isRight) return BOTTOM_RIGHT
    if (isTop) return TOP_LEFT
    return BOTTOM_LEFT
  }

  // Move the button directly to a corner via keyboard shortcut
  handleKeyboardShortcuts(event) {
    const hasModifier = event.metaKey || event.ctrlKey
    if (!hasModifier || !event.altKey) return

    let corner = null
    switch (event.code) {
      case "Digit1":
        corner = TOP_LEFT
        break
      case "Digit2":
        corner = TOP_RIGHT
        break
      case "Digit3":
        corner = BOTTOM_LEFT
        break
      case "Digit4":
        corner = BOTTOM_RIGHT
        break
      default:
        return
    }

    event.preventDefault()
    this.moveToCorner(corner)
  }

  moveToCorner(corner) {
    const leftEdge = getLeftEdge()
    const rightEdge = getPadding()
    const topEdge = this.clampTop(getHeaderHeight() + getPadding())
    const bottomEdge = this.clampTop(window.innerHeight - BUTTON_SIZE - getPadding())

    switch (corner) {
      case TOP_LEFT:
        this.element.style.left = `${leftEdge}px`
        this.element.style.right = "auto"
        this.element.style.top = `${topEdge}px`
        this.savePosition("left", topEdge)
        break
      case TOP_RIGHT:
        this.element.style.left = "auto"
        this.element.style.right = `${rightEdge}px`
        this.element.style.top = `${topEdge}px`
        this.savePosition("right", topEdge)
        break
      case BOTTOM_LEFT:
        this.element.style.left = `${leftEdge}px`
        this.element.style.right = "auto"
        this.element.style.top = `${bottomEdge}px`
        this.savePosition("left", bottomEdge)
        break
      case BOTTOM_RIGHT:
        this.element.style.left = "auto"
        this.element.style.right = `${rightEdge}px`
        this.element.style.top = `${bottomEdge}px`
        this.savePosition("right", bottomEdge)
        break
    }
  }

  savePosition(edge, topPx) {
    const topPercent = topPx / window.innerHeight * 100
    storageSet("panelButtonPosition", JSON.stringify({ edge, top: topPercent }))
  }

  // Apply the default bottom-right position
  applyDefault() {
    const padding = getPadding()
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

    const padding = getPadding()
    const minLeft = getLeftEdge()
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
      const padding = getPadding()
      const leftEdge = getLeftEdge()
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

      this.savePosition(edge, rect.top)

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

    const padding = getPadding()
    const leftEdge = getLeftEdge()

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
    const padding = getPadding()
    const minTop = getHeaderHeight() + padding
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
}
