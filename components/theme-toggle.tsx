"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark")
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light")
    } catch {}
  }

  return (
    <Button variant="ghost" size="icon-lg" onClick={toggle} aria-label="Toggle theme">
      <Sun className="size-5 dark:hidden" />
      <Moon className="hidden size-5 dark:block" />
    </Button>
  )
}
