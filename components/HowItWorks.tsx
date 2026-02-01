'use client'

import { Plus, Bell, Zap } from 'lucide-react'

export function HowItWorks() {
  const features = [
    {
      number: '01',
      icon: Plus,
      title: 'Add Subscriptions',
      description:
        'Manually add your subscriptions with costs, billing cycles, and renewal dates. Track everything in one place.',
    },
    {
      number: '02',
      icon: Bell,
      title: 'Get Smart Alerts',
      description:
        'Receive notifications before free trials end and renewals hit. Never get charged unexpectedly.',
    },
    {
      number: '03',
      icon: Zap,
      title: 'Cancel Instantly',
      description:
        'Use our Kill Switch to generate cancellation emails and find direct cancellation links. Make it effortless.',
    },
  ]

  return (
    <section
      id="howitworks"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Three simple steps to take control of your subscriptions
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl hover:border-[#333333] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Step Number */}
                <div className="text-5xl font-light text-gray-500 mb-6 group-hover:text-gray-400 transition-colors duration-300">
                  {feature.number}
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <Icon className="w-12 h-12 text-foreground group-hover:text-gray-300 transition-colors duration-300" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base text-gray-500 group-hover:text-gray-400 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
