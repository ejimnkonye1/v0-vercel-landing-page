'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Subscription } from '@/lib/types'

interface SpendingLineChartProps {
  subscriptions: Subscription[]
}

export function SpendingLineChart({ subscriptions }: SpendingLineChartProps) {
  const { isDark } = useTheme()
  const { formatAmount, symbol } = useCurrency()
  const chartData = useMemo(() => {
    const months: { name: string; spend: number }[] = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' })

      const monthlySpend = subscriptions
        .filter((s) => {
          const created = new Date(s.created_at)
          // Must have been created before end of this month
          if (created > monthEnd) return false
          // If cancelled, check if it was still active during this month
          if (s.status === 'cancelled') {
            const cancelledAt = new Date(s.updated_at)
            if (cancelledAt < monthStart) return false
          }
          return true
        })
        .reduce((sum, s) => {
          const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
          return sum + monthly
        }, 0)

      months.push({
        name: monthName,
        spend: Math.round(monthlySpend * 100) / 100,
      })
    }

    return months
  }, [subscriptions])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg px-3 py-2 shadow-xl border ${
          isDark
            ? 'bg-[#111111] border-[#222222]'
            : 'bg-white border-gray-300'
        }`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {formatAmount(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`rounded-2xl p-6 border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Spending Trend</h3>
      <p className={`text-xs mb-6 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Last 12 months</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1A1A1A' : '#e5e7eb'} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#444444' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#444444' : '#9ca3af'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${symbol}${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spend" fill={isDark ? '#ffffff' : '#000000'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
