import { useCallback, useEffect, useRef, useState } from "react"
import { storageGet, storageSet } from "../utilities/storage"
import { isMobile } from "../utilities/layout"
import { useAnnounce } from "./useAnnounce"

export function usePanel() {
  const [isOpen, setIsOpen] = useState(
    () => storageGet("panelOpen") === "true",
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const announce = useAnnounce()

  const updatePageMargin = useCallback(
    (open: boolean) => {
      const page = document.querySelector<HTMLElement>(".l-ui-page")
      if (!page) return

      if (open && !isMobile()) {
        const width = containerRef.current?.offsetWidth ?? 480
        page.style.marginRight = `${width}px`
      } else {
        page.style.marginRight = ""
      }
    },
    [],
  )

  const open = useCallback(
    (shouldAnnounce = true) => {
      previousActiveElement.current = document.activeElement
      setIsOpen(true)
      storageSet("panelOpen", "true")

      if (isMobile()) {
        const main = document.querySelector("main")
        main?.setAttribute("inert", "")
      }

      if (shouldAnnounce) {
        announce("Panel opened")
      }
    },
    [announce],
  )

  const close = useCallback(
    (shouldAnnounce = true) => {
      setIsOpen(false)
      storageSet("panelOpen", "false")

      const main = document.querySelector("main")
      main?.removeAttribute("inert")

      if (shouldAnnounce) {
        if (
          previousActiveElement.current &&
          "focus" in previousActiveElement.current
        ) {
          ;(previousActiveElement.current as HTMLElement).focus()
        }
        announce("Panel closed")
      }
    },
    [announce],
  )

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, close, open])

  // Update page margin when open state changes
  useEffect(() => {
    updatePageMargin(isOpen)
  }, [isOpen, updatePageMargin])

  // Keyboard shortcut: Cmd/Ctrl+i
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (isOpen) {
          close()
        } else {
          open()
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close, open])

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        close()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close])

  return {
    isOpen,
    containerRef,
    open,
    close,
    toggle,
  }
}
