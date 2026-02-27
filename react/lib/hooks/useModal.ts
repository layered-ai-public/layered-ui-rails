import { useCallback, useEffect, useRef } from "react"
import { useAnnounce } from "./useAnnounce"

let openCount = 0

export function useModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const announce = useAnnounce()

  const open = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    previousActiveElement.current = document.activeElement
    openCount++
    document.body.style.overflow = "hidden"
    dialog.showModal()

    requestAnimationFrame(() => {
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    })

    announce("Dialog opened")
  }, [announce])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  const closeOnBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        close()
      }
    },
    [close],
  )

  // Listen for the native close event on the dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      openCount = Math.max(0, openCount - 1)
      if (openCount === 0) {
        document.body.style.overflow = ""
      }
      if (
        previousActiveElement.current &&
        "focus" in previousActiveElement.current
      ) {
        ;(previousActiveElement.current as HTMLElement).focus()
      }
      announce("Dialog closed")
    }

    dialog.addEventListener("close", handleClose)
    return () => {
      dialog.removeEventListener("close", handleClose)
      openCount = Math.max(0, openCount - 1)
      if (openCount === 0) {
        document.body.style.overflow = ""
      }
    }
  }, [announce])

  return { dialogRef, open, close, closeOnBackdrop }
}
