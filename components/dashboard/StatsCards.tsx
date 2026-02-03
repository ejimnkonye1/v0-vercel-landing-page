'use client'

import { motion } from 'framer-motion'
import { FiDollarSign, FiTrendingUp, FiGrid, FiArrowDown } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'

interface StatsCardsProps {
  totalMonthlySpend: number
  totalYearlyProjection: number
  activeCount: number
  savingsThisMonth?: number
}

export function StatsCards({
  totalMonthlySpend,
  totalYearlyProjection,
  activeCount,
  savingsThisMonth = 0,
}: StatsCardsProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const stats = [
    {
      label: 'Monthly Spend',
      value: formatAmount(totalMonthlySpend),
      icon: FiDollarSign,
      description: 'Total recurring costs',
    },
    {
      label: 'Yearly Projection',
      value: formatAmount(totalYearlyProjection),
      icon: FiTrendingUp,
      description: 'Estimated annual cost',
    },
    {
      label: 'Active Subscriptions',
      value: activeCount.toString(),
      icon: FiGrid,
      description: 'Currently active',
    },
    {
      label: 'Savings',
      value: formatAmount(savingsThisMonth),
      icon: FiArrowDown,
      description: 'From cancellations',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`rounded-2xl p-5 transition-all duration-300 ${
              isDark
                ? 'bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#222222]'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-[#666666]' : 'text-gray-600'
              }`}>
                {stat.label}
              </span>
              <Icon className={`w-4 h-4 ${isDark ? 'text-[#444444]' : 'text-gray-400'}`} />
            </div>
            <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>{stat.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
