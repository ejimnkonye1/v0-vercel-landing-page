'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading with gradient text */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="text-foreground">Track Every Subscription.</span>
          <br />
          <span className="bg-gradient-to-r from-foreground via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Cancel Effortlessly.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto font-light">
          Never lose money to forgotten subscriptions. Track spending, get alerts before trials end, and cancel with one click.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            className="bg-foreground text-background hover:bg-gray-200 px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border border-white/30 text-foreground hover:border-white/60 hover:bg-white/5 px-8 py-4 rounded-full font-medium transition-all duration-300 bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
