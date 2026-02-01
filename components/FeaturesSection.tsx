'use client'

import { FeatureCard } from '@/components/FeatureCard'
import {
  CreditCard,
  Bell,
  BarChart3,
  Lock,
  Zap,
  Share2,
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Smart Tracking',
      description:
        'Automatically monitor all your subscriptions in one place. Never lose track again.',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Renewal Alerts',
      description:
        'Get notifications before renewal dates. Cancel anytime or find better alternatives.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Spending Analytics',
      description:
        'Visualize your subscription expenses and identify opportunities to save money.',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Bank Level Security',
      description:
        'Your data is encrypted and protected. We never store your payment information.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description:
        'Instant sync across all devices. Real-time updates when you make changes.',
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'Family Sharing',
      description:
        'Manage subscriptions for your whole family. Track shared accounts easily.',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your subscriptions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
