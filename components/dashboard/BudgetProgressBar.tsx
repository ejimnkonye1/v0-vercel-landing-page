'use client'

import { motion } from 'framer-motion'
import { FiAlertTriangle } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BudgetProgressBarProps {
  monthlySpend: number
  budgetLimit: number
  threshold: number
}

export function BudgetProgressBar({
  monthlySpend,
  budgetLimit,
  threshold,
}: BudgetProgressBarProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()

  const percentage = budgetLimit > 0 ? (monthlySpend / budgetLimit) * 100 : 0
  const cappedPercentage = Math.min(percentage, 100)
  const isWarning = percentage >= threshold && percentage < 100
  const isExceeded = percentage >= 100

  // Determine color based on status
  const getBarColor = () => {
    if (isExceeded) return isDark ? '#ef4444' : '#dc2626' // red
    if (isWarning) return isDark ? '#eab308' : '#ca8a04' // yellow
    return isDark ? '#22c55e' : '#16a34a' // green
  }

  const getTextColor = () => {
    if (isExceeded) return isDark ? 'text-red-400' : 'text-red-600'
    if (isWarning) return isDark ? 'text-yellow-400' : 'text-yellow-600'
    return isDark ? 'text-green-400' : 'text-green-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-5 ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${
            isDark ? 'text-[#666666]' : 'text-gray-600'
          }`}>
            Monthly Budget
          </span>
          {(isWarning || isExceeded) && (
            <FiAlertTriangle className={`w-3.5 h-3.5 ${getTextColor()}`} />
          )}
        </div>
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full overflow-hidden ${
        isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'
      }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${cappedPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: getBarColor() }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-3">
        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
          {formatAmount(monthlySpend)}
          <span className={`font-normal ml-1 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            spent
          </span>
        </p>
        <p className={`text-sm ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
          of {formatAmount(budgetLimit)}
        </p>
      </div>

      {/* Status message */}
      {isExceeded && (
        <p className={`text-xs mt-2 ${getTextColor()}`}>
          Budget exceeded by {formatAmount(monthlySpend - budgetLimit)}
        </p>
      )}
      {isWarning && !isExceeded && (
        <p className={`text-xs mt-2 ${getTextColor()}`}>
          {formatAmount(budgetLimit - monthlySpend)} remaining before limit
        </p>
      )}
    </motion.div>
  )
}
