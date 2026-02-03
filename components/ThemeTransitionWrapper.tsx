'use client'

import { useTheme } from '@/lib/theme-context'
import { useEffect, useState, useRef } from 'react'

interface ThemeTransitionWrapperProps {}

export function ThemeTransitionWrapper({}: ThemeTransitionWrapperProps) {
  const { isDark, isAnimating, clipCenter } = useTheme()
  const [maxRadius, setMaxRadius] = useState(2000)
  const [mounted, setMounted] = useState(false)

  // Track animation with explicit radius values
  const [darkRadius, setDarkRadius] = useState(2000)
  const [lightRadius, setLightRadius] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const savedClipCenter = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const calculateMaxRadius = () => {
      const radius = Math.sqrt(
        Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
      )
      setMaxRadius(radius)
    }

    calculateMaxRadius()
    window.addEventListener('resize', calculateMaxRadius)
    return () => window.removeEventListener('resize', calculateMaxRadius)
  }, [])

  // Initialize radius based on theme after mount
  useEffect(() => {
    if (mounted && !transitioning) {
      if (isDark) {
        setDarkRadius(maxRadius)
        setLightRadius(0)
      } else {
        setDarkRadius(0)
        setLightRadius(maxRadius)
      }
    }
  }, [mounted, isDark, maxRadius, transitioning])

  // Handle theme change animation
  useEffect(() => {
    if (isAnimating && mounted) {
      // Save the clip center immediately
      savedClipCenter.current = { ...clipCenter }
      setTransitioning(true)

      // Set the NEW theme to start at 0, then expand
      if (isDark) {
        // Switching TO dark - dark layer expands
        setDarkRadius(0)
        setLightRadius(maxRadius)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDarkRadius(maxRadius)
          })
        })
      } else {
        // Switching TO light - light layer expands
        setLightRadius(0)
        setDarkRadius(maxRadius)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setLightRadius(maxRadius)
          })
        })
      }
    }
  }, [isAnimating, isDark, clipCenter, maxRadius, mounted])

  // Reset after animation
  useEffect(() => {
    if (!isAnimating && transitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAnimating, transitioning])

  const getClipPath = (layer: 'dark' | 'light') => {
    const radius = layer === 'dark' ? darkRadius : lightRadius
    const center = savedClipCenter.current
    return `circle(${radius}px at ${center.x}px ${center.y}px)`
  }

  const getZIndex = (layer: 'dark' | 'light') => {
    // During transition, the expanding layer should be on top
    if (transitioning) {
      return isDark ? (layer === 'dark' ? 45 : 35) : (layer === 'light' ? 45 : 35)
    }
    // When not transitioning, current theme on top
    return (layer === 'dark' && isDark) || (layer === 'light' && !isDark) ? 45 : 35
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <style jsx>{`
        .dark-layer {
          clip-path: ${getClipPath('dark')};
          transition: ${
            transitioning && isDark
              ? 'clip-path 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none'
          };
          z-index: ${getZIndex('dark')};
          display: ${transitioning ? 'block' : 'none'};
        }
        .light-layer {
          clip-path: ${getClipPath('light')};
          transition: ${
            transitioning && !isDark
              ? 'clip-path 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none'
          };
          z-index: ${getZIndex('light')};
          display: ${transitioning ? 'block' : 'none'};
        }
      `}</style>

      {/* Dark Theme Layer - only for theme overlay animation */}
      <div className="dark-layer fixed inset-0 pointer-events-none overflow-hidden">
        <div className="dark fixed inset-0 bg-background" />
      </div>

      {/* Light Theme Layer - only for theme overlay animation */}
      <div className="light-layer fixed inset-0 pointer-events-none overflow-hidden">
        <div className="light fixed inset-0 bg-background" />
      </div>
    </>
  )
}
