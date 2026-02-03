'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export function Hero() {
  const { isDark } = useTheme()

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading with gradient text */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className={isDark ? 'text-white' : 'text-black'}>Track Every Subscription.</span>
          <br />
          <span
            className={`bg-clip-text text-transparent ${
              isDark
                ? 'bg-gradient-to-r from-foreground via-gray-300 to-gray-500'
                : 'bg-gradient-to-r from-foreground via-gray-600 to-gray-800'
            }`}
          >
            Cancel Effortlessly.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl mx-auto font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Never lose money to forgotten subscriptions. Track spending, get alerts before trials end, and cancel with one click.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            className={`px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className={`border px-8 py-4 rounded-full font-medium transition-all duration-300 bg-transparent ${
              isDark
                ? 'border-white/40 text-white hover:border-white/80 hover:bg-white/10'
                : 'border-black/40 text-black hover:border-black/80 hover:bg-black/10'
            }`}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
