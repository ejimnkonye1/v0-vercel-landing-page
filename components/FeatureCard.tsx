'use client'

import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-lg border border-border bg-card hover:border-accent/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
      <div className="mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
        <div className="text-accent">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
