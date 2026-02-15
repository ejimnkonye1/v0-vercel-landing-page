'use client'

import { useTheme } from '@/lib/theme-context'
import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react'

interface ThemeTransitionWrapperProps {
  children: ReactNode
}

export function ThemeTransitionWrapper({ children }: ThemeTransitionWrapperProps) {
  const { isDark, isAnimating, clipCenter } = useTheme()
  const [maxRadius, setMaxRadius] = useState(2000)
  const darkLayerRef = useRef<HTMLDivElement>(null)
  const lightLayerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)
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

  // Sync scroll between both layers
  const handleScroll = useCallback((source: 'dark' | 'light') => {
    if (isScrolling.current) return
    isScrolling.current = true

    const sourceRef = source === 'dark' ? darkLayerRef : lightLayerRef
    const targetRef = source === 'dark' ? lightLayerRef : darkLayerRef

    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop
    }

    requestAnimationFrame(() => {
      isScrolling.current = false
    })
  }, [])

  useEffect(() => {
    const darkLayer = darkLayerRef.current
    const lightLayer = lightLayerRef.current

    const onDarkScroll = () => handleScroll('dark')
    const onLightScroll = () => handleScroll('light')

    darkLayer?.addEventListener('scroll', onDarkScroll)
    lightLayer?.addEventListener('scroll', onLightScroll)

    return () => {
      darkLayer?.removeEventListener('scroll', onDarkScroll)
      lightLayer?.removeEventListener('scroll', onLightScroll)
    }
  }, [handleScroll])

  const getClipPath = (layer: 'dark' | 'light') => {
    const radius = layer === 'dark' ? darkRadius : lightRadius
    const center = savedClipCenter.current
    return `circle(${radius}px at ${center.x}px ${center.y}px)`
  }

  const getZIndex = (layer: 'dark' | 'light') => {
    // During transition, the expanding layer should be on top
    if (transitioning) {
      return isDark ? (layer === 'dark' ? 60 : 50) : (layer === 'light' ? 60 : 50)
    }
    // When not transitioning, current theme on top
    return (layer === 'dark' && isDark) || (layer === 'light' && !isDark) ? 60 : 50
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Dark Theme Layer */}
      <div
        ref={darkLayerRef}
        className="fixed inset-0 overflow-y-scroll"
        style={{
          clipPath: getClipPath('dark'),
          transition: transitioning && isDark
            ? 'clip-path 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
          zIndex: getZIndex('dark'),
        }}
      >
        <div className="dark">
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </div>
      </div>

      {/* Light Theme Layer */}
      <div
        ref={lightLayerRef}
        className="fixed inset-0 overflow-y-scroll"
        style={{
          clipPath: getClipPath('light'),
          transition: transitioning && !isDark
            ? 'clip-path 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
          zIndex: getZIndex('light'),
        }}
      >
        <div className="light">
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
