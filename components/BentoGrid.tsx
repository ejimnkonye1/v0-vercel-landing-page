'use client'

import { motion } from 'framer-motion'
import { TrendingDown, Lock, Bell, BarChart3 } from 'lucide-react'

export function BentoGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Everything you need to take control of your subscriptions
          </p>
        </motion.div>

        {/* Asymmetric Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
        >
          {/* Card 1: Large Feature - Cost Tracking */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 lg:row-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <TrendingDown className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
                <h3 className="text-3xl font-semibold text-white mb-2">
                  Smart Cost Tracking
                </h3>
                <p className="text-base text-gray-400 max-w-sm">
                  See exactly where your money goes with detailed spending analytics and monthly breakdowns.
                </p>
              </div>
            </div>
            {/* Mockup visualization */}
            <div className="mt-12 p-6 bg-black rounded-2xl border border-[#222222]">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Spotify</span>
                  <span className="text-sm text-white font-medium">$12.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gray-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Netflix</span>
                  <span className="text-sm text-white font-medium">$19.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Alerts */}
          <motion.div
            variants={itemVariants}
            className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <Bell className="w-10 h-10 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Alerts
            </h3>
            <p className="text-sm text-gray-400">
              Never miss a renewal or trial expiry with timely notifications.
            </p>
          </motion.div>

          {/* Card 3: Kill Switch */}
          <motion.div
            variants={itemVariants}
            className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <Lock className="w-10 h-10 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Kill Switch
            </h3>
            <p className="text-sm text-gray-400">
              One-click cancellation with pre-written emails and direct links.
            </p>
          </motion.div>

          {/* Card 4: Analytics - spans 2 cols */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <BarChart3 className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-base text-gray-400 max-w-sm mb-8">
              Visualize spending trends and identify optimization opportunities.
            </p>
            {/* Simple chart visualization */}
            <div className="flex items-end justify-between gap-2 h-16">
              {[40, 60, 35, 75, 50, 80, 55].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-1 bg-gray-600 rounded-t transition-all duration-300 hover:bg-gray-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
