'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[#1a1a1a] bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
            <span className="text-background font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-foreground text-base hidden sm:inline group-hover:text-gray-300 transition-colors duration-200">
            SubTracker
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-gray-500 hover:text-foreground transition-colors duration-200 text-sm"
          >
            Features
          </Link>
          <Link
            href="#howitworks"
            className="text-gray-500 hover:text-foreground transition-colors duration-200 text-sm"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-gray-500 hover:text-foreground transition-colors duration-200 text-sm"
          >
            Pricing
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-foreground hover:bg-white/5 transition-all duration-200 rounded-full"
          >
            Log In
          </Button>
          <Button className="bg-foreground text-background hover:bg-gray-200 rounded-full font-medium transition-all duration-200 transform hover:scale-105">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
