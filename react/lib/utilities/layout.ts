export const MOBILE_BREAKPOINT = 768
export const NAV_WIDTH = 240
export const HEADER_HEIGHT = 63
export const DEFAULT_PANEL_WIDTH = 480

export function isMobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}
