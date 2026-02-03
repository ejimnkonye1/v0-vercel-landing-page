'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
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

interface SpendingChartProps {
  subscriptions: Subscription[]
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  const { isDark } = useTheme()
  const { formatAmount, symbol } = useCurrency()
  const chartData = useMemo(() => {
    const months: { name: string; spend: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' })

      const monthlySpend = subscriptions
        .filter((s) => {
          const created = new Date(s.created_at)
          // Subscription must have been created before end of this month
          if (created > monthEnd) return false
          // If cancelled, it was still active before its updated_at date
          if (s.status === 'cancelled') {
            const cancelledAt = new Date(s.updated_at)
            // If cancelled before this month started, it wasn't active this month
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
        <div className={`rounded-lg px-3 py-2 shadow-xl ${
          isDark
            ? 'bg-[#111111] border border-[#222222]'
            : 'bg-white border border-gray-300'
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
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`rounded-2xl p-6 ${
        isDark 
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Spending Overview</h3>
      <p className={`text-xs mb-6 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Last 6 months</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={0.1} />
                <stop offset="95%" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="spend"
              stroke={isDark ? '#ffffff' : '#000000'}
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
