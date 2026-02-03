'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiDollarSign, FiTag, FiClock } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { getSubscriptionIcon } from '@/lib/icons'
import { KillSwitch } from './KillSwitch'
import type { Subscription } from '@/lib/types'

interface DetailViewProps {
  subscription: Subscription
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const statusStyles: Record<string, string> = {
  active: 'bg-[#1A1A1A] text-[#CCCCCC]',
  trial: 'bg-[#1A1A1A] text-[#999999]',
  cancelled: 'bg-[#111111] text-[#555555]',
}

const statusStylesLight: Record<string, string> = {
  active: 'bg-gray-200 text-gray-700',
  trial: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

export function DetailView({ subscription }: DetailViewProps) {
  const { isDark } = useTheme()
  const Icon = getSubscriptionIcon(
    subscription.logo_identifier || subscription.name
  )
  const monthlyCost =
    subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

  const renewalDate = new Date(subscription.renewal_date)
  const formattedRenewal = renewalDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      {/* Back button */}
      <Link
        href="/dashboard"
        className={`inline-flex items-center gap-2 text-sm mb-8 transition-colors ${
          isDark
            ? 'text-[#555555] hover:text-white'
            : 'text-gray-600 hover:text-black'
        }`}
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 mb-6 border ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A]'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
            isDark
              ? 'bg-[#111111] border-[#1A1A1A]'
              : 'bg-gray-200 border-gray-300'
          }`}>
            <Icon className={`w-8 h-8 ${isDark ? 'text-white' : 'text-black'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{subscription.name}</h1>
              <span
                className={`text-xs px-3 py-1 rounded-full capitalize ${
                  isDark 
                    ? (statusStyles[subscription.status] || statusStyles.active)
                    : (statusStylesLight[subscription.status] || statusStylesLight.active)
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <p className={`text-sm capitalize ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>{subscription.category}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatCurrency(subscription.cost)}
            </p>
            <p className={`text-sm ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
              per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
            </p>
            {subscription.billing_cycle === 'yearly' && (
              <p className={`text-xs mt-1 ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>
                {formatCurrency(monthlyCost)}/mo effective
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 border ${
            isDark
              ? 'bg-[#0A0A0A] border-[#1A1A1A]'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-[#111111]' : 'bg-gray-200'
              }`}>
                <FiCalendar className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Next Renewal</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{formattedRenewal}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-[#111111]' : 'bg-gray-200'
              }`}>
                <FiDollarSign className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Billing Cycle</p>
                <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-black'}`}>{subscription.billing_cycle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-[#111111]' : 'bg-gray-200'
              }`}>
                <FiTag className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Category</p>
                <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-black'}`}>{subscription.category}</p>
              </div>
            </div>

            {subscription.trial_end_date && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#111111]' : 'bg-gray-200'
                }`}>
                  <FiClock className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Trial Ends</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                    {new Date(subscription.trial_end_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {subscription.last_used && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#111111]' : 'bg-gray-200'
                }`}>
                  <FiClock className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Last Used</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                    {new Date(subscription.last_used).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {subscription.notes && (
            <div className={`mt-6 pt-4 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
              <p className={`text-xs mb-2 ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Notes</p>
              <p className={`text-sm ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{subscription.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Kill Switch */}
        <KillSwitch subscription={subscription} />
      </div>
    </>
  )
}
