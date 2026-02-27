import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../utilities/cn"
import { useTabs, type UseTabsOptions } from "../hooks/useTabs"

/* ------------------------------------------------------------------ */
/*  Tabs (compound component)                                          */
/* ------------------------------------------------------------------ */

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  items: TabItem[]
  defaultTab?: string
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ items, defaultTab, className, ...props }, ref) => {
    const tabIds = items.map((item) => item.id)
    const { activeTab, select, onKeyDown, getTabProps, getPanelProps } =
      useTabs({ tabs: tabIds, defaultTab })

    return (
      <div ref={ref} className={className} {...props}>
        <div
          className="l-ui-tabs__list"
          role="tablist"
          onKeyDown={(e) => {
            onKeyDown(e, activeTab)
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              {...getTabProps(item.id)}
              onClick={() => select(item.id, item.label)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {items.map((item) => (
          <div key={item.id} {...getPanelProps(item.id)}>
            {item.content}
          </div>
        ))}
      </div>
    )
  },
)
Tabs.displayName = "Tabs"

/* ------------------------------------------------------------------ */
/*  Individual parts for custom composition                            */
/* ------------------------------------------------------------------ */

export const TabList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn("l-ui-tabs__list", className)}
      {...props}
    />
  ),
)
TabList.displayName = "TabList"

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ active, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cn(
        active ? "l-ui-tabs__tab--active" : "l-ui-tabs__tab",
        className,
      )}
      {...props}
    />
  ),
)
Tab.displayName = "Tab"

export const TabPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      className={cn("l-ui-tabs__panel", className)}
      {...props}
    />
  ),
)
TabPanel.displayName = "TabPanel"

export { useTabs, type UseTabsOptions }
