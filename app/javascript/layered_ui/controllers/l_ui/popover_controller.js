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
    // Handled on `beforetoggle` rather than `toggle`: the native toggle event
    // is dispatched asynchronously, so positioning there lets the browser paint
    // the popover at the viewport origin for a frame first, and attaching the
    // scroll listener there misses any scroll that lands in between (e.g.
    // Turbo restoring the scroll position on back navigation). `beforetoggle`
    // fires synchronously just before the popover opens - too early to measure
    // it, as it isn't rendered yet - so position in the next animation frame,
    // which runs after it opens but before the first paint.
    this._beforeToggleHandler = (event) => {
      if (event.newState === "open") {
        this._addRepositionListeners()
        requestAnimationFrame(() => this.position())
      } else {
        this._removeRepositionListeners()
      }
    }
    element.addEventListener("beforetoggle", this._beforeToggleHandler)

    if (element.matches(":popover-open")) {
      // Already open when connected (e.g. preserved across a Turbo morph).
      this._addRepositionListeners()
      this.position()
    } else if (this.openValue) {
      // Open on connect when requested (e.g. re-opening a filter popover after
      // a form submission re-renders the page). Position in the same task so
      // it never paints unpositioned.
      element.showPopover()
      this.position()
    }
  }

  popoverTargetDisconnected(element) {
    element.removeEventListener("beforetoggle", this._beforeToggleHandler)
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
    if (!this.popoverTarget.matches(":popover-open")) return

    // A trigger that isn't rendered (e.g. inside a collapsed sidebar or a
    // hidden tab panel) measures as a 0x0 box at the viewport origin, which
    // would strand the popover in the top-left corner. Close it instead.
    if (this.triggerTarget.getClientRects().length === 0) {
      this.popoverTarget.hidePopover()
      return
    }

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
    if (this._repositionHandler) return
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
