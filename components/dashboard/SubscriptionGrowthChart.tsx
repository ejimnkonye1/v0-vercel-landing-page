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

interface SubscriptionGrowthChartProps {
  subscriptions: Subscription[]
}

const timeframes = [
  { key: '24h', label: '24h', days: 1 },
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: '90d', label: '90d', days: 90 },
] as const

type TimeframeKey = typeof timeframes[number]['key']

export function SubscriptionGrowthChart({ subscriptions }: SubscriptionGrowthChartProps) {
  const { isDark } = useTheme()
  const { formatAmount, symbol } = useCurrency()
  const [timeframe, setTimeframe] = useState<TimeframeKey>('30d')

  const tf = timeframes.find(t => t.key === timeframe)!

  const cancelledSubs = useMemo(
    () => subscriptions.filter(s => s.status === 'cancelled'),
    [subscriptions]
  )

  const chartData = useMemo(() => {
    const points: { name: string; savings: number }[] = []
    const now = new Date()

    // Helper: calculate cumulative monthly savings at a given date
    // For each cancelled sub, count full months saved from cancellation to the target date
    function getSavingsAt(targetDate: Date): number {
      return cancelledSubs.reduce((total, s) => {
        const cancelledAt = new Date(s.updated_at)
        if (cancelledAt > targetDate) return total

        const monthlyCost = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
        // Calculate months between cancellation and target
        const monthsDiff =
          (targetDate.getFullYear() - cancelledAt.getFullYear()) * 12 +
          (targetDate.getMonth() - cancelledAt.getMonth())
        // Add partial month based on day of month
        const partialMonth = (targetDate.getDate() - cancelledAt.getDate()) / 30
        const totalMonths = Math.max(0, monthsDiff + partialMonth)

        return total + monthlyCost * totalMonths
      }, 0)
    }

    if (tf.days === 1) {
      for (let i = 5; i >= 0; i--) {
        const blockTime = new Date(now.getTime() - i * 4 * 3600000)
        const label = blockTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        points.push({ name: label, savings: Math.round(getSavingsAt(blockTime) * 100) / 100 })
      }
    } else if (tf.days <= 7) {
      for (let i = tf.days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 86400000)
        const label = date.toLocaleDateString('en-US', { weekday: 'short' })
        points.push({ name: label, savings: Math.round(getSavingsAt(date) * 100) / 100 })
      }
    } else if (tf.days <= 30) {
      for (let i = tf.days - 1; i >= 0; i -= 5) {
        const date = new Date(now.getTime() - i * 86400000)
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        points.push({ name: label, savings: Math.round(getSavingsAt(date) * 100) / 100 })
      }
    } else {
      for (let i = Math.floor(tf.days / 7); i >= 0; i--) {
        const date = new Date(now.getTime() - i * 7 * 86400000)
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        points.push({ name: label, savings: Math.round(getSavingsAt(date) * 100) / 100 })
      }
    }

    return points
  }, [cancelledSubs, tf])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg px-3 py-2 shadow-xl ${
          isDark
            ? 'bg-[#111111] border border-[#222222]'
            : 'bg-white border border-gray-300'
        }`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{label}</p>
          <p className="text-sm font-semibold text-[#f59e0b]">
            {formatAmount(payload[0].value)} saved
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
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`rounded-2xl p-6 ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Cumulative Savings</h3>
          <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            {cancelledSubs.length > 0
              ? `${cancelledSubs.length} cancelled sub${cancelledSubs.length > 1 ? 's' : ''} saving you money`
              : 'Cancel unused subs to start saving'}
          </p>
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
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
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
              dataKey="savings"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#savingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
