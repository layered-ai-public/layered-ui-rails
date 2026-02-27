import { useCallback, useState } from "react"
import { useAnnounce } from "./useAnnounce"

export interface UseTabsOptions {
  /** Tab IDs in order. */
  tabs: string[]
  /** Initially active tab ID. Defaults to first tab. */
  defaultTab?: string
}

export function useTabs({ tabs, defaultTab }: UseTabsOptions) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0] ?? "")
  const announce = useAnnounce()

  const select = useCallback(
    (tabId: string, label?: string) => {
      setActiveTab(tabId)
      if (label) announce(`${label} tab selected`)
    },
    [announce],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, currentTabId: string) => {
      const currentIndex = tabs.indexOf(currentTabId)
      if (currentIndex === -1) return

      let targetIndex: number | undefined

      switch (event.key) {
        case "ArrowRight":
          targetIndex = (currentIndex + 1) % tabs.length
          break
        case "ArrowLeft":
          targetIndex = (currentIndex - 1 + tabs.length) % tabs.length
          break
        case "Home":
          targetIndex = 0
          break
        case "End":
          targetIndex = tabs.length - 1
          break
        default:
          return
      }

      event.preventDefault()
      const targetId = tabs[targetIndex]
      if (targetId) {
        setActiveTab(targetId)
        // Focus the target tab button
        const targetButton = document.getElementById(targetId)
        targetButton?.focus()
      }
    },
    [tabs],
  )

  const getTabProps = useCallback(
    (tabId: string) => ({
      id: tabId,
      role: "tab" as const,
      "aria-selected": activeTab === tabId,
      "aria-controls": `${tabId}-panel`,
      tabIndex: activeTab === tabId ? 0 : -1,
      className:
        activeTab === tabId
          ? "l-ui-tabs__tab--active"
          : "l-ui-tabs__tab",
    }),
    [activeTab],
  )

  const getPanelProps = useCallback(
    (tabId: string) => ({
      id: `${tabId}-panel`,
      role: "tabpanel" as const,
      "aria-labelledby": tabId,
      hidden: activeTab !== tabId,
      className: "l-ui-tabs__panel",
    }),
    [activeTab],
  )

  return { activeTab, select, onKeyDown, getTabProps, getPanelProps }
}
