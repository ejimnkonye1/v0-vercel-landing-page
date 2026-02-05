'use client'

import { useMemo, useState } from 'react'
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

const timeframes = [
  { key: '24h', label: '24h', days: 1 },
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: '90d', label: '90d', days: 90 },
] as const

type TimeframeKey = typeof timeframes[number]['key']

function getDailySpendRate(subscriptions: Subscription[], date: Date) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(dayStart.getTime() + 86400000)

  return subscriptions
    .filter((s) => {
      const created = new Date(s.created_at)
      if (created > dayEnd) return false
      if (s.status === 'cancelled') {
        const cancelledAt = new Date(s.updated_at)
        if (cancelledAt < dayStart) return false
      }
      return true
    })
    .reduce((sum, s) => {
      const daily = s.billing_cycle === 'yearly' ? s.cost / 365 : s.cost / 30
      return sum + daily
    }, 0)
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  const { isDark } = useTheme()
  const { formatAmount, symbol } = useCurrency()
  const [timeframe, setTimeframe] = useState<TimeframeKey>('30d')

  const tf = timeframes.find(t => t.key === timeframe)!

  const chartData = useMemo(() => {
    const points: { name: string; spend: number }[] = []
    const now = new Date()

    if (tf.days === 1) {
      // 24h: show 6 x 4-hour blocks
      for (let i = 5; i >= 0; i--) {
        const blockTime = new Date(now.getTime() - i * 4 * 3600000)
        const label = blockTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        const rate = getDailySpendRate(subscriptions, blockTime)
        points.push({ name: label, spend: Math.round(rate * 100) / 100 })
      }
    } else if (tf.days <= 7) {
      // 7d: show each day
      for (let i = tf.days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 86400000)
        const label = date.toLocaleDateString('en-US', { weekday: 'short' })
        const rate = getDailySpendRate(subscriptions, date)
        points.push({ name: label, spend: Math.round(rate * 100) / 100 })
      }
    } else if (tf.days <= 30) {
      // 30d: show every 5 days
      for (let i = tf.days - 1; i >= 0; i -= 5) {
        const date = new Date(now.getTime() - i * 86400000)
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const rate = getDailySpendRate(subscriptions, date)
        points.push({ name: label, spend: Math.round(rate * 100) / 100 })
      }
    } else {
      // 90d: show weekly
      for (let i = Math.floor(tf.days / 7); i >= 0; i--) {
        const date = new Date(now.getTime() - i * 7 * 86400000)
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const rate = getDailySpendRate(subscriptions, date)
        points.push({ name: label, spend: Math.round(rate * 100) / 100 })
      }
    }

    return points
  }, [subscriptions, tf])

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
            {formatAmount(payload[0].value)}/day
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Spending Overview</h3>
          <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Daily spend rate over time</p>
        </div>
        <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${isDark ? 'bg-[#111111]' : 'bg-gray-200'}`}>
          {timeframes.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTimeframe(t.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                timeframe === t.key
                  ? isDark
                    ? 'bg-[#222222] text-white'
                    : 'bg-white text-black shadow-sm'
                  : isDark
                    ? 'text-[#666666] hover:text-[#999999]'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

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
