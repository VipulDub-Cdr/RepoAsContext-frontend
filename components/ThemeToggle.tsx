"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 border border-border-dim rounded-md bg-background" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative h-9 w-9 cursor-pointer rounded-md border border-border-dim bg-background text-foreground hover:bg-accent-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-green overflow-hidden transition-colors shrink-0"
      aria-label="Toggle theme"
    >
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
            size={18} 
            className={`absolute transition-all duration-500 ease-in-out transform ${
              theme === 'light' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`} 
        />
        {/* Moon Icon */}
        <Moon 
            size={18} 
            className={`absolute transition-all duration-500 ease-in-out transform ${
              theme === 'dark' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`} 
        />
      </div>
    </button>
  )
}
