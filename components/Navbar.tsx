'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-gray-800/30 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/assets/real black logo.png"
            alt="SubWise Logo"
            className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-200"
          />
          <span className="font-semibold text-base hidden sm:inline text-white group-hover:opacity-80 transition-opacity duration-200">
            SubWise
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            Features
          </Link>
          <Link
            href="#howitworks"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            Pricing
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-full"
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full font-medium transition-all duration-200 transform hover:scale-105">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
