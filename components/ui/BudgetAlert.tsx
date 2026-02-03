'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BudgetAlertProps {
  monthlySpend: number
  budgetLimit: number
  threshold: number
}

export function BudgetAlert({
  monthlySpend,
  budgetLimit,
  threshold,
}: BudgetAlertProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [dismissed, setDismissed] = useState(false)

  const percentage = budgetLimit > 0 ? (monthlySpend / budgetLimit) * 100 : 0
  const isExceeded = percentage >= 100
  const isWarning = percentage >= threshold && percentage < 100
  const shouldShow = (isWarning || isExceeded) && !dismissed

  // Reset dismissed state when spending goes back under threshold
  useEffect(() => {
    if (percentage < threshold) {
      setDismissed(false)
    }
  }, [percentage, threshold])

  // Check session storage to avoid showing alert multiple times
  useEffect(() => {
    const key = `budget-alert-dismissed-${Math.floor(percentage / 10) * 10}`
    const wasDismissed = sessionStorage.getItem(key)
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [percentage])

  const handleDismiss = () => {
    const key = `budget-alert-dismissed-${Math.floor(percentage / 10) * 10}`
    sessionStorage.setItem(key, 'true')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
            isExceeded
              ? isDark
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-red-50 border border-red-200'
              : isDark
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <FiAlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
            isExceeded
              ? isDark ? 'text-red-400' : 'text-red-600'
              : isDark ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              isExceeded
                ? isDark ? 'text-red-400' : 'text-red-700'
                : isDark ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              {isExceeded
                ? 'Budget exceeded!'
                : `Budget warning: ${percentage.toFixed(0)}% used`}
            </p>
            <p className={`text-xs mt-1 ${
              isExceeded
                ? isDark ? 'text-red-400/70' : 'text-red-600'
                : isDark ? 'text-yellow-400/70' : 'text-yellow-600'
            }`}>
              {isExceeded
                ? `You've spent ${formatAmount(monthlySpend)} of your ${formatAmount(budgetLimit)} budget.`
                : `You've used ${formatAmount(monthlySpend)} of your ${formatAmount(budgetLimit)} budget.`}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className={`p-1 rounded-lg transition-colors ${
              isExceeded
                ? isDark
                  ? 'text-red-400/50 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-red-400 hover:text-red-600 hover:bg-red-100'
                : isDark
                  ? 'text-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            <FiX className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
