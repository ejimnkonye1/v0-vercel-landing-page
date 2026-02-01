'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For those getting started',
      features: [
        'Track up to 10 subscriptions',
        'Monthly spending overview',
        'Email renewal alerts',
        'Basic analytics',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      description: 'For power users',
      period: '/month',
      features: [
        'Unlimited subscriptions',
        'Advanced analytics',
        'Email & SMS alerts',
        'Family sharing (5 users)',
        'Cancellation links',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$29.99',
      description: 'For teams',
      period: '/month',
      features: [
        'Everything in Pro',
        'Advanced team management',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg border p-8 transition-all ${
                plan.highlighted
                  ? 'border-accent bg-card shadow-lg shadow-accent/20 ring-1 ring-accent/50'
                  : 'border-border bg-card hover:border-accent/50'
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground ml-2">
                    {plan.period}
                  </span>
                )}
              </div>

              <Button
                className={`w-full mb-8 rounded-full ${
                  plan.highlighted
                    ? 'bg-accent text-white hover:bg-blue-600'
                    : 'bg-foreground text-background hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
