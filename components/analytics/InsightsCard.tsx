'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiAlertCircle, FiDollarSign } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Subscription } from '@/lib/types'

interface InsightsCardProps {
  subscriptions: Subscription[]
}

export function InsightsCard({ subscriptions }: InsightsCardProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const insights = useMemo(() => {
    const result: { icon: any; title: string; description: string }[] = []
    const active = subscriptions.filter(
      (s) => s.status === 'active' || s.status === 'trial'
    )

    // Spending by category comparison
    const categorySpend: Record<string, number> = {}
    active.forEach((s) => {
      const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
      categorySpend[s.category] = (categorySpend[s.category] || 0) + monthly
    })

    const categories = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])
    if (categories.length >= 2) {
      const topCat = categories[0]
      const bottomCat = categories[categories.length - 1]
      if (bottomCat[1] > 0) {
        const ratio = Math.round((topCat[1] / bottomCat[1]) * 100 - 100)
        if (ratio > 0) {
          result.push({
            icon: FiTrendingUp,
            title: 'Category Insight',
            description: `You spend ${ratio}% more on ${topCat[0]} than ${bottomCat[0]}`,
          })
        }
      }
    }

    // Unused subscriptions (last_used > 30 days ago or null)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const unused = active.filter((s) => {
      if (!s.last_used) return true
      return new Date(s.last_used) < thirtyDaysAgo
    })
    if (unused.length > 0) {
      result.push({
        icon: FiAlertCircle,
        title: 'Unused Subscriptions',
        description: `${unused.length} subscription${unused.length > 1 ? 's' : ''} unused in the last 30 days`,
      })
    }

    // Savings from switching to annual
    const monthlyOnly = active.filter((s) => s.billing_cycle === 'monthly')
    if (monthlyOnly.length > 0) {
      const potentialSavings = monthlyOnly.reduce(
        (sum, s) => sum + s.cost * 12 * 0.17,
        0
      )
      result.push({
        icon: FiDollarSign,
        title: 'Potential Savings',
        description: `Save up to ${formatAmount(potentialSavings)}/yr by switching ${monthlyOnly.length} subscription${monthlyOnly.length > 1 ? 's' : ''} to annual plans`,
      })
    }

    return result
  }, [subscriptions])

  if (insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, i) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`rounded-2xl p-5 border transition-all duration-300 ${
                isDark
                  ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#222222]'
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                isDark ? 'bg-[#111111]' : 'bg-gray-300'
              }`}>
                <Icon className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-600'}`} />
              </div>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{insight.title}</p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                {insight.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
