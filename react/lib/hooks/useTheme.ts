import { useCallback, useEffect, useState } from "react"
import { storageGet, storageSet } from "../utilities/storage"
import { useAnnounce } from "./useAnnounce"

export function useTheme() {
  const announce = useAnnounce()

  const [isDark, setIsDark] = useState(() => {
    const saved = storageGet("theme")
    if (saved) return saved === "dark"
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  // Sync the .dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      storageSet("theme", next ? "dark" : "light")
      announce(next ? "Dark mode enabled" : "Light mode enabled")
      return next
    })
  }, [announce])

  return { isDark, toggle }
}
