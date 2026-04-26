let lockCount = 0
let savedScrollY = null

export function lockBodyScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY
    document.body.style.top = `-${savedScrollY}px`
    document.body.classList.add("l-ui-scroll-lock")
  }

  lockCount++
}

export function unlockBodyScroll() {
  if (lockCount === 0) return

  lockCount--

  if (lockCount === 0) {
    document.body.classList.remove("l-ui-scroll-lock")
    document.body.style.top = ""

    if (savedScrollY !== null) {
      window.scrollTo(0, savedScrollY)
    }

    savedScrollY = null
  }
}
