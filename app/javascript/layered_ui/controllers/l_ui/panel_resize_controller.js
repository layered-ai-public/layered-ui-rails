import { Controller } from "@hotwired/stimulus"
import { storageGet, storageSet, storageRemove } from "layered_ui/utilities/storage"
import { isMobile, hasNavigation, NAV_WIDTH } from "layered_ui/utilities/layout"

const MIN_WIDTH = 240
const DEFAULT_WIDTH = 480

export default class extends Controller {
  static targets = ["container", "handle"]

  connect() {
    this.isResizing = false
    this.boundResize = this.resize.bind(this)
    this.boundStopResize = this.stopResize.bind(this)
    this._resizeFrame = null
    this.boundWindowResize = () => {
      if (this._resizeFrame) return
      this._resizeFrame = requestAnimationFrame(() => {
        this._resizeFrame = null
        this.handleWindowResize()
      })
    }

    this.restoreWidth()
    this.updateHandleAria(this.containerTarget.offsetWidth)
    window.addEventListener('resize', this.boundWindowResize)
  }

  disconnect() {
    cancelAnimationFrame(this._resizeFrame)
    window.removeEventListener('resize', this.boundWindowResize)

    if (this.isResizing) {
      document.removeEventListener('mousemove', this.boundResize)
      document.removeEventListener('mouseup', this.boundStopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      this.isResizing = false
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
    const maxWidth = this.getMaxWidth()
    const newWidth = Math.min(Math.max(this.startWidth + deltaX, MIN_WIDTH), maxWidth)

    this.containerTarget.style.width = `${newWidth}px`
    this.updateHandleAria(newWidth)
    this.dispatch("widthChanged")
  }

  // Stop resizing and save the new width
  stopResize() {
    if (!this.isResizing) return

    this.isResizing = false
    document.removeEventListener('mousemove', this.boundResize)
    document.removeEventListener('mouseup', this.boundStopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    if (!isMobile()) {
      storageSet("panelWidth", this.containerTarget.style.width)
    }
  }

  // Handle keyboard navigation for resize handle
  handleKeydown(event) {
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
        newWidth = MIN_WIDTH
        break
      default:
        return
    }

    const maxWidth = this.getMaxWidth()
    newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth)

    this.containerTarget.style.width = `${newWidth}px`
    this.updateHandleAria(newWidth)
    this.dispatch("widthChanged")

    if (!isMobile()) {
      storageSet("panelWidth", `${newWidth}px`)
    }
  }

  // Reset panel width to default
  resetWidth(event) {
    event.preventDefault()
    if (isMobile()) {
      this.containerTarget.style.width = ''
    } else {
      this.containerTarget.style.width = `${DEFAULT_WIDTH}px`
      storageRemove("panelWidth")
    }
    this.updateHandleAria(this.containerTarget.offsetWidth)
    this.dispatch("widthChanged")
  }

  // Restore width from localStorage
  restoreWidth() {
    if (isMobile()) {
      this.containerTarget.style.width = ''
    } else {
      const savedWidth = storageGet("panelWidth")
      if (savedWidth) {
        const maxWidth = this.getMaxWidth()
        const savedValue = parseInt(savedWidth, 10)
        const constrainedWidth = Math.min(Math.max(savedValue, MIN_WIDTH), maxWidth)
        this.containerTarget.style.width = `${constrainedWidth}px`
        this.updateHandleAria(constrainedWidth)
      }
    }
  }

  // Handle window resize events
  handleWindowResize() {
    this.restoreWidth()
    this.updateHandleAria(this.containerTarget.offsetWidth)
    this.dispatch("widthChanged")
  }

  // Get maximum panel width
  getMaxWidth() {
    const navWidth = hasNavigation() ? NAV_WIDTH : 0
    return window.innerWidth - navWidth - MIN_WIDTH
  }

  // Update the resize handle's ARIA values
  updateHandleAria(width) {
    if (this.hasHandleTarget) {
      this.handleTarget.setAttribute("aria-valuemin", MIN_WIDTH)
      this.handleTarget.setAttribute("aria-valuenow", width)
      this.handleTarget.setAttribute("aria-valuemax", this.getMaxWidth())
      this.handleTarget.setAttribute("aria-valuetext", `Panel width: ${width} pixels`)
    }
  }
}
