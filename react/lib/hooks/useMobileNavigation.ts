import { useCallback, useEffect, useRef, useState } from "react"
import { isMobile, MOBILE_BREAKPOINT } from "../utilities/layout"
import { useAnnounce } from "./useAnnounce"

export function useMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const previousActiveElement = useRef<Element | null>(null)
  const navigationRef = useRef<HTMLElement>(null)
  const announce = useAnnounce()

  const openNavigation = useCallback(() => {
    previousActiveElement.current = document.activeElement
    setIsOpen(true)

    // Prevent background content from being tabbable
    const main = document.querySelector("main")
    const panel = document.querySelector(".l-ui-container--panel")
    main?.setAttribute("inert", "")
    panel?.setAttribute("inert", "")

    requestAnimationFrame(() => {
      const firstFocusable = navigationRef.current?.querySelector<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    })

    announce("Navigation menu opened")
  }, [announce])

  const closeNavigation = useCallback(() => {
    setIsOpen(false)

    const main = document.querySelector("main")
    const panel = document.querySelector(".l-ui-container--panel")
    main?.removeAttribute("inert")
    panel?.removeAttribute("inert")

    if (
      previousActiveElement.current &&
      "focus" in previousActiveElement.current
    ) {
      ;(previousActiveElement.current as HTMLElement).focus()
    }

    announce("Navigation menu closed")
  }, [announce])

  const toggle = useCallback(() => {
    if (isOpen) {
      closeNavigation()
    } else {
      openNavigation()
    }
  }, [isOpen, closeNavigation, openNavigation])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeNavigation()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeNavigation])

  // Close on resize to desktop
  useEffect(() => {
    let frame: number | null = null

    const handleResize = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        if (!isMobile() && isOpen) {
          setIsOpen(false)
          const main = document.querySelector("main")
          const panel = document.querySelector(".l-ui-container--panel")
          main?.removeAttribute("inert")
          panel?.removeAttribute("inert")
        }
      })
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isOpen])

  // Set inert on navigation when closed on mobile
  useEffect(() => {
    const nav = navigationRef.current
    if (!nav) return

    if (isMobile() && !isOpen) {
      nav.setAttribute("inert", "")
      nav.setAttribute("aria-hidden", "true")
    } else {
      nav.removeAttribute("inert")
      nav.removeAttribute("aria-hidden")
    }
  }, [isOpen])

  // Listen for breakpoint changes
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`)
    const handler = () => {
      const nav = navigationRef.current
      if (!nav) return

      if (mql.matches) {
        nav.removeAttribute("inert")
        nav.removeAttribute("aria-hidden")
      } else if (!isOpen) {
        nav.setAttribute("inert", "")
        nav.setAttribute("aria-hidden", "true")
      }
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [isOpen])

  return {
    isOpen,
    navigationRef,
    toggle,
    openNavigation,
    closeNavigation,
  }
}
