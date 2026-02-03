'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/lib/theme-context'

export function Navbar() {
  const { isDark } = useTheme()

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 ${
      isDark 
        ? 'border-b border-[#222222] bg-[#0a0a0a]/80' 
        : 'border-b border-gray-200 bg-white/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src={isDark ? '/assets/real black logo.png' : '/assets/real white logo.png'}
            alt="SubTracker Logo"
            className="w-8 h-8 object-contain transition-opacity duration-300"
          />
          <span className={`font-semibold text-base hidden sm:inline group-hover:opacity-80 transition-opacity duration-200 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            SubTracker
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className={`transition-colors duration-200 text-sm ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Features
          </Link>
          <Link
            href="#howitworks"
            className={`transition-colors duration-200 text-sm ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className={`transition-colors duration-200 text-sm ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Pricing
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              className={`transition-all duration-200 rounded-full ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-black hover:bg-black/5'
              }`}
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className={`rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
