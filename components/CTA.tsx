'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-5xl sm:text-6xl font-semibold text-foreground mb-6">
          Start Tracking Today
        </h2>

        {/* Subheading */}
        <p className="text-xl text-gray-500 mb-12 leading-relaxed">
          Never forget to cancel a subscription again. Take control of your recurring payments in minutes.
        </p>

        {/* CTA Button */}
        <Button className="bg-foreground text-background hover:bg-gray-200 px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-lg">
          Get Started Free
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* Subtext */}
        <p className="text-sm text-gray-600 mt-6">
          No credit card required. Start tracking instantly.
        </p>
      </div>
    </section>
  )
}
