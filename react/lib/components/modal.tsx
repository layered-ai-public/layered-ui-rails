import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../utilities/cn"
import { useModal } from "../hooks/useModal"
import { IconClose } from "../icons"

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  children: ReactNode
  className?: string
  /** Accessible label for the dialog. */
  ariaLabelledBy?: string
}

/** Complete modal component with built-in hook. */
export function useModalComponent() {
  const { dialogRef, open, close, closeOnBackdrop } = useModal()

  function ModalDialog({
    children,
    className,
    ariaLabelledBy,
  }: ModalProps) {
    return (
      <dialog
        ref={dialogRef}
        className={cn("l-ui-modal", className)}
        aria-labelledby={ariaLabelledBy}
        onClick={closeOnBackdrop}
      >
        {children}
      </dialog>
    )
  }

  return { Modal: ModalDialog, open, close, dialogRef }
}

/* ------------------------------------------------------------------ */
/*  ModalHeader                                                        */
/* ------------------------------------------------------------------ */

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  /** ID for the heading, used for aria-labelledby on the dialog. */
  headingId?: string
  heading?: ReactNode
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ onClose, headingId, heading, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-modal__header", className)} {...props}>
      {heading ? <h3 id={headingId}>{heading}</h3> : children}
      {onClose && (
        <button
          type="button"
          className="l-ui-button--icon"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose width={20} height={20} aria-hidden="true" />
        </button>
      )}
    </div>
  ),
)
ModalHeader.displayName = "ModalHeader"

/* ------------------------------------------------------------------ */
/*  ModalBody                                                          */
/* ------------------------------------------------------------------ */

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-modal__body", className)} {...props} />
  ),
)
ModalBody.displayName = "ModalBody"
