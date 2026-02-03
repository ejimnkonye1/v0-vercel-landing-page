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
import type { Subscription } from '@/lib/types'

interface SpendingChartProps {
  subscriptions: Subscription[]
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
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
        <div className="bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-[#999999] text-xs mb-1">{label}</p>
          <p className="text-white text-sm font-semibold">
            ${payload[0].value.toFixed(2)}
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
      className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
    >
      <h3 className="text-white font-semibold text-sm mb-1">Spending Overview</h3>
      <p className="text-[#555555] text-xs mb-6">Last 6 months</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#444444"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#444444"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
