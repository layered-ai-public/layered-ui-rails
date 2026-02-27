import { type ReactNode } from "react"
import { useModalComponent, ModalHeader, ModalBody } from "@layered-ui/components/modal"

interface CodeModalProps {
  id: string
  heading: string
  children: ReactNode
  buttonLabel?: string
}

export function CodeModal({
  id,
  heading,
  children,
  buttonLabel = "View code",
}: CodeModalProps) {
  const { Modal, open, close } = useModalComponent()

  return (
    <>
      <button
        type="button"
        className="l-ui-button--outline"
        onClick={open}
      >
        {buttonLabel}
      </button>
      <Modal ariaLabelledBy={id}>
        <ModalHeader headingId={id} heading={heading} onClose={close} />
        <ModalBody>{children}</ModalBody>
      </Modal>
    </>
  )
}
