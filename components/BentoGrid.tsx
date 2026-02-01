'use client'

import { TrendingDown, Lock, Bell, BarChart3 } from 'lucide-react'

export function BentoGrid() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Everything you need to take control of your subscriptions
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {/* Card 1: Large Feature - Cost Tracking */}
          <div className="lg:col-span-2 lg:row-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-8">
              <div>
                <TrendingDown className="w-12 h-12 text-foreground mb-4" strokeWidth={1.5} />
                <h3 className="text-3xl font-semibold text-foreground mb-2">
                  Smart Cost Tracking
                </h3>
                <p className="text-base text-gray-500 max-w-sm">
                  See exactly where your money goes with detailed spending analytics and monthly breakdowns.
                </p>
              </div>
            </div>
            {/* Mockup visualization */}
            <div className="mt-12 p-6 bg-black rounded-2xl border border-[#222222]">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Spotify</span>
                  <span className="text-sm text-foreground font-medium">$12.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gray-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Netflix</span>
                  <span className="text-sm text-foreground font-medium">$19.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Alerts */}
          <div className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300">
            <Bell className="w-10 h-10 text-foreground mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Smart Alerts
            </h3>
            <p className="text-sm text-gray-500">
              Never miss a renewal or trial expiry with timely notifications.
            </p>
          </div>

          {/* Card 3: Kill Switch */}
          <div className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300">
            <Lock className="w-10 h-10 text-foreground mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Kill Switch
            </h3>
            <p className="text-sm text-gray-500">
              One-click cancellation with pre-written emails and direct links.
            </p>
          </div>

          {/* Card 4: Analytics - spans 2 cols */}
          <div className="lg:col-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300">
            <BarChart3 className="w-12 h-12 text-foreground mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Advanced Analytics
            </h3>
            <p className="text-base text-gray-500 max-w-sm mb-8">
              Visualize spending trends and identify optimization opportunities.
            </p>
            {/* Simple chart visualization */}
            <div className="flex items-end justify-between gap-2 h-16">
              {[40, 60, 35, 75, 50, 80, 55].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gray-600 rounded-t transition-all duration-300 hover:bg-gray-400"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
