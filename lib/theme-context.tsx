'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ClipCenter {
  x: number
  y: number
}

interface ThemeContextType {
  isDark: boolean
  isAnimating: boolean
  clipCenter: ClipCenter
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [clipCenter, setClipCenter] = useState<ClipCenter>({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme')
    if (stored) {
      setIsDark(stored === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    }
  }, [])

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (mounted) {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, mounted])

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setClipCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
    
    setIsAnimating(true)
    setIsDark(prev => !prev)
    setTimeout(() => setIsAnimating(false), 1200)
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        isAnimating,
        clipCenter,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
