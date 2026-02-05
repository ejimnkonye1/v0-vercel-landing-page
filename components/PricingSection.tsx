'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      description: 'For those getting started',
      features: [
        'Track up to 10 subscriptions',
        'Monthly spending overview',
        'Email renewal alerts',
        'Basic analytics',
        'Kill Switch access',
      ],
      cta: 'Get Started',
      href: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      description: 'For power users',
      features: [
        'Unlimited subscriptions',
        'Advanced analytics & charts',
        'AI Subscription Advisor',
        'Price Intelligence alerts',
        'Browser extension',
        'Email receipt scanner',
        'Family sharing (5 users)',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      href: '/signup',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$29.99',
      period: '/month',
      description: 'For teams & organizations',
      features: [
        'Everything in Pro',
        'Advanced team management',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      href: '/signup',
      highlighted: false,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for you. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative group rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'bg-[#0d0d0d] border-2 border-white/20 hover:border-white/40'
                  : 'bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#333333]'
              }`}
            >
              {/* Recommended badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-white text-black text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-semibold text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 ml-1">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <Link href={plan.href}>
                <button
                  className={`w-full py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-8 ${
                    plan.highlighted
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#222222] border border-[#333333]'
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>

              {/* Features */}
              <div className="space-y-3.5">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted
                        ? 'bg-white/10'
                        : 'bg-[#1a1a1a]'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.highlighted ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-600 mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
