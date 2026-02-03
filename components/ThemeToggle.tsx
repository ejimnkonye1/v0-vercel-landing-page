'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { isDark, isAnimating, toggleTheme } = useTheme()

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      disabled={isAnimating}
      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 animate-in fade-in duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 animate-in fade-in duration-300" />
      )}
    </button>
  )
}
