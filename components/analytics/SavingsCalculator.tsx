'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiChevronUp, FiDollarSign } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getSubscriptionIcon } from '@/lib/icons'
import type { Subscription } from '@/lib/types'

interface SavingsCalculatorProps {
  subscriptions: Subscription[]
}

const ANNUAL_DISCOUNT = 0.17 // 17% typical savings for annual plans

export function SavingsCalculator({ subscriptions }: SavingsCalculatorProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [expanded, setExpanded] = useState(false)

  const { monthlySubscriptions, savingsData, totalSavings } = useMemo(() => {
    const active = subscriptions.filter(
      (s) => (s.status === 'active' || s.status === 'trial') && s.billing_cycle === 'monthly'
    )

    const data = active.map((sub) => {
      const currentMonthly = sub.cost
      const currentYearly = sub.cost * 12
      const projectedAnnualCost = currentYearly * (1 - ANNUAL_DISCOUNT)
      const projectedMonthly = projectedAnnualCost / 12
      const yearlySavings = currentYearly - projectedAnnualCost

      return {
        id: sub.id,
        name: sub.name,
        logoIdentifier: sub.logo_identifier || sub.name,
        currentMonthly,
        projectedMonthly,
        yearlySavings,
      }
    }).sort((a, b) => b.yearlySavings - a.yearlySavings)

    const total = data.reduce((sum, d) => sum + d.yearlySavings, 0)

    return {
      monthlySubscriptions: active,
      savingsData: data,
      totalSavings: total,
    }
  }, [subscriptions])

  if (monthlySubscriptions.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-6 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-[#0D0D0D]' : 'hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-[#111111]' : 'bg-gray-200'
          }`}>
            <FiDollarSign className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              Annual Plan Savings
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
              Save up to {formatAmount(totalSavings)}/year by switching to annual plans
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {formatAmount(totalSavings)}
          </span>
          {expanded ? (
            <FiChevronUp className={`w-5 h-5 ${isDark ? 'text-[#555555]' : 'text-gray-500'}`} />
          ) : (
            <FiChevronDown className={`w-5 h-5 ${isDark ? 'text-[#555555]' : 'text-gray-500'}`} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`border-t ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
              {/* Table header */}
              <div className={`grid grid-cols-4 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-[#666666] bg-[#0D0D0D]' : 'text-gray-500 bg-gray-100'
              }`}>
                <div>Subscription</div>
                <div className="text-right">Current</div>
                <div className="text-right">If Annual</div>
                <div className="text-right">Savings/yr</div>
              </div>

              {/* Table body */}
              <div className="divide-y divide-[#1A1A1A]">
                {savingsData.map((item) => {
                  const Icon = getSubscriptionIcon(item.logoIdentifier)
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-4 gap-4 px-6 py-4 items-center ${
                        isDark ? 'hover:bg-[#0D0D0D]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-[#111111]' : 'bg-gray-200'
                        }`}>
                          <Icon className={`w-4 h-4 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`} />
                        </div>
                        <span className={`text-sm font-medium truncate ${
                          isDark ? 'text-white' : 'text-black'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      <div className={`text-right text-sm ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
                        {formatAmount(item.currentMonthly)}/mo
                      </div>
                      <div className={`text-right text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                        {formatAmount(item.projectedMonthly)}/mo
                      </div>
                      <div className={`text-right text-sm font-medium ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {formatAmount(item.yearlySavings)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total row */}
              <div className={`grid grid-cols-4 gap-4 px-6 py-4 border-t ${
                isDark ? 'border-[#1A1A1A] bg-[#0D0D0D]' : 'border-gray-200 bg-gray-100'
              }`}>
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  Total ({savingsData.length} subscriptions)
                </div>
                <div />
                <div />
                <div className={`text-right text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {formatAmount(totalSavings)}/yr
                </div>
              </div>

              {/* Note */}
              <div className={`px-6 py-4 ${isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>
                  * Estimates based on typical 17% discount for annual billing. Actual savings may vary by service.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
