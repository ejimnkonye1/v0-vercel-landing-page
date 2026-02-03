'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { getSubscriptionIcon } from '@/lib/icons'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Subscription } from '@/lib/types'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  index: number
}

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

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  index,
}: SubscriptionCardProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const Icon = getSubscriptionIcon(
    subscription.logo_identifier || subscription.name
  )
  const renewalDate = new Date(subscription.renewal_date)
  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const monthlyCost =
    subscription.billing_cycle === 'yearly'
      ? subscription.cost / 12
      : subscription.cost

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 group ${
        isDark
          ? 'bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#222222]'
          : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/subscription/${subscription.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 ${
            isDark
              ? 'bg-[#111111] border-[#1A1A1A]'
              : 'bg-gray-200 border-gray-300'
          }`}>
            <Icon className={`w-5 h-5 transition-colors ${
              isDark
                ? 'text-[#999999] group-hover:text-white'
                : 'text-gray-600 group-hover:text-black'
            }`} />
          </div>
          <div className="min-w-0">
            <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {subscription.name}
            </h3>
            <p className={`text-xs capitalize ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>{subscription.category}</p>
          </div>
        </Link>

        {/* Status badge */}
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            isDark 
              ? (statusStyles[subscription.status] || statusStyles.active)
              : (statusStylesLight[subscription.status] || statusStylesLight.active)
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {formatAmount(subscription.cost)}
          <span className={`text-xs font-normal ml-1 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            /{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}
          </span>
        </p>
        {subscription.billing_cycle === 'yearly' && (
          <p className={`text-xs ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>
            {formatAmount(monthlyCost)}/mo effective
          </p>
        )}
      </div>

      {/* Renewal date */}
      <p className={`text-xs mb-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
        Next billing: {formattedDate}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEdit(subscription)
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white border-[#1A1A1A] hover:border-[#333333]'
              : 'text-gray-600 hover:text-black border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiEdit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(subscription.id)
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white border-[#1A1A1A] hover:border-[#333333]'
              : 'text-gray-600 hover:text-black border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiTrash2 className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
