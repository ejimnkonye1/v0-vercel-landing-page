'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiCalendar } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getSubscriptionIcon } from '@/lib/icons'
import type { Subscription } from '@/lib/types'

interface UpcomingRenewalsProps {
  subscriptions: Subscription[]
}

export function UpcomingRenewals({ subscriptions }: UpcomingRenewalsProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const upcoming = useMemo(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return subscriptions
      .filter((s) => {
        if (s.status === 'cancelled') return false
        const renewal = new Date(s.renewal_date)
        return renewal >= now && renewal <= weekFromNow
      })
      .sort(
        (a, b) =>
          new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
      )
  }, [subscriptions])

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-sm ${
            isDark ? 'text-white' : 'text-black'
          }`}>Upcoming Renewals</h3>
          <p className={`text-xs mt-0.5 ${
            isDark ? 'text-[#555555]' : 'text-gray-600'
          }`}>Next 7 days</p>
        </div>
        <FiCalendar className={`w-4 h-4 ${
          isDark ? 'text-[#444444]' : 'text-gray-400'
        }`} />
      </div>

      {upcoming.length === 0 ? (
        <p className={`text-sm py-4 ${
          isDark ? 'text-[#444444]' : 'text-gray-500'
        }`}>No renewals in the next 7 days</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((sub) => {
            const Icon = getSubscriptionIcon(sub.logo_identifier || sub.name)
            const renewalDate = new Date(sub.renewal_date)
            const daysUntil = Math.ceil(
              (renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Link
                key={sub.id}
                href={`/subscription/${sub.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                  isDark
                    ? 'bg-[#0D0D0D] border-[#1A1A1A] hover:border-[#222222]'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#111111]' : 'bg-gray-200'
                }`}>
                  <Icon className={`w-4 h-4 transition-colors ${
                    isDark ? 'text-[#999999] group-hover:text-white' : 'text-gray-600 group-hover:text-black'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>{sub.name}</p>
                  <p className={`text-xs ${
                    isDark ? 'text-[#555555]' : 'text-gray-600'
                  }`}>
                    {daysUntil < 0
                      ? 'Overdue'
                      : daysUntil === 0
                        ? 'Today'
                        : daysUntil === 1
                          ? 'Tomorrow'
                          : `In ${daysUntil} days`}
                  </p>
                </div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {formatAmount(sub.cost)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
