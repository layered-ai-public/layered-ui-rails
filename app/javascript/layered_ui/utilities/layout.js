export const MOBILE_BREAKPOINT = 768
export const NAV_WIDTH = 240
export const HEADER_HEIGHT = 63

export function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function hasNavigation() {
  const page = document.querySelector(".l-ui-page")
  const alwaysShow = document.body.classList.contains("l-ui-body--always-show-navigation")
  return page && page.classList.contains("l-ui-page--with-navigation") && !isMobile() && alwaysShow
}

export function getPadding() {
  return isMobile() ? 16 : 32
}

export function getLeftEdge() {
  const navWidth = hasNavigation() ? NAV_WIDTH : 0
  return navWidth + getPadding()
}
