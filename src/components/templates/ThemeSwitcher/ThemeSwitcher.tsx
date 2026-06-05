"use client"

import { Button } from "@/src/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

const ThemeSwitcher = () => {
  const { setTheme, resolvedTheme } = useTheme()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <Button onClick={() => setTheme(isDark ? "light" : "dark")} size="icon">
      {isDark ? (
        <Sun className="h-4 w-4" key="sun" />
      ) : (
        <Moon className="h-4 w-4" key="moon" />
      )}
    </Button>
  )
}

export default ThemeSwitcher
