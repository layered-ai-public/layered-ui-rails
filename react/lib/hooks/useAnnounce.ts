import { useCallback, useRef } from "react"

/**
 * Provides a function to announce messages to screen readers via a live region.
 * The live region element must have id="l-ui-live-region".
 */
export function useAnnounce() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const announce = useCallback((message: string) => {
    const liveRegion = document.getElementById("l-ui-live-region")
    if (!liveRegion) return

    liveRegion.textContent = message

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      liveRegion.textContent = ""
    }, 3000)
  }, [])

  return announce
}
