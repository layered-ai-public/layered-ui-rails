import { Controller } from "@hotwired/stimulus"

// Positions a native `popover`-attribute element relative to its trigger.
// Showing, hiding, light-dismiss, and Escape-to-close are all handled by the
// browser via the popover attribute; this controller only computes placement
// (with auto-flip near viewport edges), since CSS anchor positioning isn't
// yet reliable across all supported browsers.
export default class extends Controller {
  static targets = ["trigger", "popover"]
  static values = {
    placement: { type: String, default: "bottom" },
    align: { type: String, default: "start" },
    open: { type: Boolean, default: false }
  }

  static GAP = 8

  popoverTargetConnected(element) {
    this._toggleHandler = (event) => {
      if (event.newState === "open") {
        this.position()
        this._addRepositionListeners()
      } else {
        this._removeRepositionListeners()
      }
    }
    element.addEventListener("toggle", this._toggleHandler)

    // Open on connect when requested (e.g. re-opening a filter popover after
    // a form submission re-renders the page). showPopover() and position()
    // must run back-to-back in the same task: the native toggle event is
    // dispatched asynchronously, so relying on the listener alone would paint
    // the popover unpositioned at the viewport origin for one frame.
    if (this.openValue && !element.matches(":popover-open")) {
      element.showPopover()
      this.position()
    }
  }

  popoverTargetDisconnected(element) {
    element.removeEventListener("toggle", this._toggleHandler)
    this._removeRepositionListeners()
  }

  disconnect() {
    this._removeRepositionListeners()
  }

  // Compute and apply the popover's fixed position relative to the trigger,
  // flipping to the opposite side if the preferred placement would overflow
  // the viewport.
  position() {
    if (!this.hasTriggerTarget || !this.hasPopoverTarget) return

    const gap = this.constructor.GAP
    const trigger = this.triggerTarget.getBoundingClientRect()
    const popover = this.popoverTarget.getBoundingClientRect()
    const align = this.alignValue

    // The cross-axis coordinate (horizontal for top/bottom, vertical for
    // left/right): "start" flushes the popover's leading edge with the
    // trigger's, "end" flushes its trailing edge instead - e.g. a "bottom"
    // placement with "end" align hangs the popover down and to the left of
    // a trigger sitting at the right end of a row.
    const crossAxisStart = (placement) =>
      placement === "top" || placement === "bottom"
        ? align === "end" ? trigger.right - popover.width : trigger.left
        : align === "end" ? trigger.bottom - popover.height : trigger.top

    const coordsFor = (placement) => {
      switch (placement) {
        case "top":
          return { top: trigger.top - popover.height - gap, left: crossAxisStart(placement) }
        case "left":
          return { top: crossAxisStart(placement), left: trigger.left - popover.width - gap }
        case "right":
          return { top: crossAxisStart(placement), left: trigger.right + gap }
        default:
          return { top: trigger.bottom + gap, left: crossAxisStart(placement) }
      }
    }

    let placement = this.placementValue
    let coords = coordsFor(placement)

    if (placement === "bottom" && coords.top + popover.height > window.innerHeight) {
      placement = "top"
      coords = coordsFor(placement)
    } else if (placement === "top" && coords.top < 0) {
      placement = "bottom"
      coords = coordsFor(placement)
    } else if (placement === "right" && coords.left + popover.width > window.innerWidth) {
      placement = "left"
      coords = coordsFor(placement)
    } else if (placement === "left" && coords.left < 0) {
      placement = "right"
      coords = coordsFor(placement)
    }

    let left = coords.left
    if (placement === "top" || placement === "bottom") {
      left = Math.min(Math.max(gap, left), window.innerWidth - popover.width - gap)
    }

    this.popoverTarget.style.top = `${Math.max(gap, coords.top)}px`
    this.popoverTarget.style.left = `${left}px`
  }

  // Private

  _addRepositionListeners() {
    this._repositionHandler = () => this.position()
    window.addEventListener("resize", this._repositionHandler)
    window.addEventListener("scroll", this._repositionHandler, true)
  }

  _removeRepositionListeners() {
    if (!this._repositionHandler) return
    window.removeEventListener("resize", this._repositionHandler)
    window.removeEventListener("scroll", this._repositionHandler, true)
    this._repositionHandler = null
  }
}
