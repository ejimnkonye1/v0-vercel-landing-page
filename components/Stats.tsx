'use client'

import { motion } from 'framer-motion'

export function Stats() {
  const stats = [
    {
      number: '10,000+',
      label: 'Subscriptions Tracked',
    },
    {
      number: '$500,000',
      label: 'Users Saved',
    },
    {
      number: '$48',
      label: 'Average Monthly Savings',
    },
  ]

  return (
    <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Large Number */}
              <div className="text-5xl sm:text-6xl font-bold text-white mb-3">
                {stat.number}
              </div>

              {/* Label */}
              <p className="text-base sm:text-lg text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
