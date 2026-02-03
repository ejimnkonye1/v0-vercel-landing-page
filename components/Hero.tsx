'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { StarfieldBackground } from '@/components/StarfieldBackground'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center relative bg-[#0a0a0a] overflow-hidden">
      <StarfieldBackground />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Track Every Subscription. Cancel Effortlessly.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto font-light"
        >
          Never lose money to forgotten subscriptions. Track spending, get alerts before trials end, and cancel with one click.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border border-white/30 text-white hover:border-white/60 hover:bg-white/5 px-8 py-4 rounded-full font-medium transition-all duration-300 bg-transparent"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
