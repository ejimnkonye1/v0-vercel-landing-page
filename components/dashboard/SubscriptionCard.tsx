'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash2, FiHeart, FiInfo, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { getSubscriptionIcon } from '@/lib/icons'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { calculateHealthScore, getHealthScoreColor, getHealthScoreBgColor } from '@/lib/healthScore'
import type { Subscription, PriceTrendInfo } from '@/lib/types'

interface SubscriptionCardProps {
  subscription: Subscription
  allSubscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  index: number
  priceTrend?: PriceTrendInfo
}

const statusStyles: Record<string, string> = {
  active: 'bg-[#1A1A1A] text-[#CCCCCC]',
  trial: 'bg-[#1A1A1A] text-[#999999]',
  cancelled: 'bg-[#111111] text-[#555555]',
}

const statusStylesLight: Record<string, string> = {
  active: 'bg-gray-200 text-gray-700',
  trial: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

export function SubscriptionCard({
  subscription,
  allSubscriptions,
  onEdit,
  onDelete,
  index,
  priceTrend,
}: SubscriptionCardProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [showHealthTooltip, setShowHealthTooltip] = useState(false)

  const Icon = getSubscriptionIcon(
    subscription.logo_identifier || subscription.name
  )
  const renewalDate = new Date(subscription.renewal_date)
  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const monthlyCost =
    subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

  // Calculate health score for active subscriptions
  const healthResult = subscription.status === 'active'
    ? calculateHealthScore(subscription, allSubscriptions)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 group ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#222222]'
          : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/subscription/${subscription.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 ${
            isDark
              ? 'bg-[#111111] border-[#1A1A1A]'
              : 'bg-gray-200 border-gray-300'
          }`}>
            <Icon className={`w-5 h-5 transition-colors ${
              isDark
                ? 'text-[#999999] group-hover:text-white'
                : 'text-gray-600 group-hover:text-black'
            }`} />
          </div>
          <div className="min-w-0">
            <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {subscription.name}
            </h3>
            <p className={`text-xs capitalize ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>{subscription.category}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Health score badge */}
          {healthResult && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowHealthTooltip(true)}
                onMouseLeave={() => setShowHealthTooltip(false)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${getHealthScoreBgColor(healthResult.score, isDark)}`}
              >
                <FiHeart className={`w-3 h-3 ${getHealthScoreColor(healthResult.score, isDark)}`} />
                <span className={getHealthScoreColor(healthResult.score, isDark)}>{healthResult.score}</span>
              </button>

              {/* Tooltip */}
              <AnimatePresence>
                {showHealthTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`absolute right-0 top-full mt-2 w-56 p-3 rounded-xl z-50 shadow-xl border ${
                      isDark
                        ? 'bg-[#111111] border-[#222222]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FiInfo className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>Health Score</span>
                    </div>
                    <p className={`text-xs mb-2 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                      {healthResult.recommendation}
                    </p>
                    <div className={`text-xs space-y-1 pt-2 border-t ${isDark ? 'border-[#222222]' : 'border-gray-200'}`}>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#666666]' : 'text-gray-500'}>Usage</span>
                        <span className={isDark ? 'text-[#999999]' : 'text-gray-700'}>{healthResult.breakdown.usageScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#666666]' : 'text-gray-500'}>Value</span>
                        <span className={isDark ? 'text-[#999999]' : 'text-gray-700'}>{healthResult.breakdown.valueScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#666666]' : 'text-gray-500'}>Age</span>
                        <span className={isDark ? 'text-[#999999]' : 'text-gray-700'}>{healthResult.breakdown.ageScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Price trend badge */}
          {priceTrend && priceTrend.trend !== 'stable' && (
            <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full ${
              priceTrend.trend === 'rising'
                ? isDark ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-600'
                : isDark ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              {priceTrend.trend === 'rising' ? (
                <FiTrendingUp className="w-3 h-3" />
              ) : (
                <FiTrendingDown className="w-3 h-3" />
              )}
              {Math.abs(priceTrend.changePercent)}%
            </span>
          )}

          {/* Status badge */}
          <span
            className={`text-xs px-2 py-1 rounded-full capitalize ${
              isDark
                ? (statusStyles[subscription.status] || statusStyles.active)
                : (statusStylesLight[subscription.status] || statusStylesLight.active)
            }`}
          >
            {subscription.status}
          </span>
        </div>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {formatAmount(subscription.cost)}
          <span className={`text-xs font-normal ml-1 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            /{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}
          </span>
        </p>
        {subscription.billing_cycle === 'yearly' && (
          <p className={`text-xs ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>
            {formatAmount(monthlyCost)}/mo effective
          </p>
        )}
      </div>

      {/* Renewal date */}
      <p className={`text-xs mb-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
        Next billing: {formattedDate}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEdit(subscription)
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white border-[#1A1A1A] hover:border-[#333333]'
              : 'text-gray-600 hover:text-black border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiEdit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(subscription.id)
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white border-[#1A1A1A] hover:border-[#333333]'
              : 'text-gray-600 hover:text-black border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiTrash2 className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
