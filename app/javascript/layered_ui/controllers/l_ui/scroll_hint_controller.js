import { Controller } from "@hotwired/stimulus"

// Fades the clipped edges of a horizontal scroller (e.g. a wide table)
// while more content is available in that direction, making it obvious
// the region can be scrolled. Attach to an l-ui-scroll-hint wrapper with
// the scrollable element as the scroller target.
export default class extends Controller {
  static targets = ["scroller"]

  connect() {
    this.update = this.update.bind(this)
    this.scrollerTarget.addEventListener("scroll", this.update, { passive: true })

    // Watch both the scroller and its content, so the hints stay correct
    // when the viewport or the table itself changes size
    this.resizeObserver = new ResizeObserver(this.update)
    this.resizeObserver.observe(this.scrollerTarget)
    if (this.scrollerTarget.firstElementChild) {
      this.resizeObserver.observe(this.scrollerTarget.firstElementChild)
    }

    this.update()
  }

  disconnect() {
    this.scrollerTarget.removeEventListener("scroll", this.update)
    this.resizeObserver.disconnect()
  }

  update() {
    const scroller = this.scrollerTarget
    // 1px tolerance for fractional scroll positions on high-DPI screens
    const overflows = scroller.scrollWidth - scroller.clientWidth > 1

    // Keep the region keyboard-scrollable while it overflows (WCAG 2.1.1)
    if (overflows) {
      scroller.setAttribute("tabindex", "0")
    } else {
      scroller.removeAttribute("tabindex")
    }

    this.element.classList.toggle("l-ui-scroll-hint--left", scroller.scrollLeft > 1)
    this.element.classList.toggle("l-ui-scroll-hint--right", overflows && scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 1)
  }
}
