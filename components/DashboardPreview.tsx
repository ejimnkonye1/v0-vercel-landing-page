'use client'

import { motion } from 'framer-motion'

export function DashboardPreview() {
  const subscriptions = [
    { name: 'Spotify', price: '$12.99', renewalDate: 'Mar 15' },
    { name: 'Netflix', price: '$19.99', renewalDate: 'Mar 20' },
    { name: 'Adobe Creative', price: '$59.99', renewalDate: 'Mar 10' },
    { name: 'ChatGPT Pro', price: '$20.00', renewalDate: 'Mar 25' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Your Dashboard Awaits
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Get a complete overview of all your subscriptions and spending at a glance
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] transition-all duration-300 overflow-hidden">
            {/* Header */}
            <motion.div 
              className="mb-8 pb-8 border-b border-[#1a1a1a]"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-white mb-2">
                My Subscriptions
              </h3>
              <p className="text-gray-400">
                Total monthly: <span className="text-white font-semibold">$112.97</span>
              </p>
            </motion.div>

            {/* Subscription List */}
            <motion.div 
              className="space-y-4 mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {subscriptions.map((sub, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center justify-between p-4 bg-black rounded-xl border border-[#222222] hover:border-[#333333] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-semibold">
                        {sub.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{sub.name}</p>
                      <p className="text-xs text-gray-500">Renews {sub.renewalDate}</p>
                    </div>
                  </div>
                  <p className="text-white font-semibold">{sub.price}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Summary Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 p-6 bg-black rounded-2xl border border-[#1a1a1a]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Total Annual</p>
                <p className="text-xl font-bold text-white">$1,355.64</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Active Subs</p>
                <p className="text-xl font-bold text-white">12</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
                <p className="text-xl font-bold text-white">$248</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  )
}
