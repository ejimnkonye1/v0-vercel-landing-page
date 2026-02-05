'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Subscription } from '@/lib/types'

interface CategoryBreakdownProps {
  subscriptions: Subscription[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#f59e0b',
  'Productivity': '#3b82f6',
  'Fitness': '#10b981',
  'Developer Tools': '#8b5cf6',
  'Storage': '#ec4899',
  'Social Media': '#06b6d4',
  'Other': '#6b7280',
}

const DEFAULT_COLOR = '#6b7280'

export function CategoryBreakdown({ subscriptions }: CategoryBreakdownProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()

  const { data, totalSpend } = useMemo(() => {
    const categoryMap: Record<string, number> = {}

    subscriptions
      .filter(s => s.status !== 'cancelled')
      .forEach(s => {
        const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
        const cat = s.category || 'Other'
        categoryMap[cat] = (categoryMap[cat] || 0) + monthly
      })

    const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)

    const sorted = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)

    return { data: sorted, totalSpend: total }
  }, [subscriptions])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      return (
        <div className={`rounded-lg px-3 py-2 shadow-xl ${
          isDark
            ? 'bg-[#111111] border border-[#222222]'
            : 'bg-white border border-gray-300'
        }`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{entry.name}</p>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {formatAmount(entry.value)}/mo
          </p>
          <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>{entry.percent}% of total</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className={`rounded-2xl p-6 ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="mb-6">
        <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Spending by Category</h3>
        <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
          {data.length} {data.length === 1 ? 'category' : 'categories'} &middot; {formatAmount(totalSpend)}/mo total
        </p>
      </div>

      {data.length === 0 ? (
        <div className={`flex items-center justify-center h-48 text-sm ${isDark ? 'text-[#555555]' : 'text-gray-400'}`}>
          No active subscriptions yet
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="w-40 h-40 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {data.length}
              </span>
              <span className={`text-[10px] ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                categories
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`text-xs truncate ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                    {formatAmount(entry.value)}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#444444]' : 'text-gray-400'}`}>
                    {entry.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
