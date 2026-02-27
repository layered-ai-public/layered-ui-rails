import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../utilities/cn"
import { usePanel } from "../hooks/usePanel"
import { IconChevronRight, PanelIconLight, PanelIconDark } from "../icons"

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

export interface PanelProps {
  heading?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ heading, children, className }: PanelProps) {
  const { isOpen, containerRef, open, close } = usePanel()

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        className={cn("l-ui-panel__button", isOpen && "hidden")}
        onClick={() => open()}
        aria-expanded={isOpen}
        aria-label="Open panel"
        style={{ bottom: 24, right: 24 }}
      >
        <span className="l-ui-panel__icon--light" aria-hidden="true">
          <PanelIconLight />
        </span>
        <span className="l-ui-panel__icon--dark" aria-hidden="true">
          <PanelIconDark />
        </span>
      </button>

      {/* Panel container */}
      <div
        ref={containerRef}
        className={cn(
          "l-ui-container--panel",
          isOpen && "open",
          className,
        )}
        aria-hidden={!isOpen}
        {...(!isOpen ? { inert: "" as unknown as boolean } : {})}
      >
        <div className="l-ui-panel">
          <div className="l-ui-panel__header">
            <div className="l-ui-panel__header-content">
              <div className="l-ui-panel__header-buttons">
                <div className="l-ui-panel__header-heading">
                  {heading}
                </div>
                <div className="l-ui-panel__header-actions">
                  <button
                    type="button"
                    className="l-ui-button--icon l-ui-button--panel-close"
                    onClick={() => close()}
                    aria-label="Close panel"
                  >
                    <IconChevronRight width={20} height={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="l-ui-panel__body">{children}</div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  PanelBody                                                          */
/* ------------------------------------------------------------------ */

export const PanelBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("l-ui-panel__body", className)} {...props} />
  ),
)
PanelBody.displayName = "PanelBody"
