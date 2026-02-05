'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGrid, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { SubscriptionCard } from './SubscriptionCard'
import type { Subscription, PriceTrendInfo } from '@/lib/types'

interface SubscriptionGridProps {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  priceTrends?: Record<string, PriceTrendInfo>
}

export function SubscriptionGrid({
  subscriptions,
  onEdit,
  onDelete,
  priceTrends,
}: SubscriptionGridProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'trial' | 'cancelled'>('all')
  const [expanded, setExpanded] = useState(false)
  const { isDark } = useTheme()

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || sub.status === filter
    return matchesSearch && matchesFilter
  })

  // 2 rows: 6 on xl (3-col), 4 on md (2-col), 2 on mobile (1-col) — use 6 as the cap
  const INITIAL_COUNT = 6
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT)
  const hasMore = filtered.length > INITIAL_COUNT

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FiGrid className={`w-4 h-4 ${isDark ? 'text-[#444444]' : 'text-gray-400'}`} />
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
            Subscriptions
          </h3>
          <span className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>({filtered.length})</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-[#444444]' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`text-xs rounded-lg pl-9 pr-3 py-2 w-full sm:w-32 md:w-40 lg:w-48 focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder:text-[#444444] focus:border-[#333333]'
                  : 'bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-500'
              }`}
            />
          </div>

          {/* Filter */}
          <div className={`flex items-center rounded-lg p-0.5 overflow-x-auto ${
            isDark
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
              : 'bg-gray-50 border border-gray-300'
          }`}>
            {(['all', 'active', 'trial', 'cancelled'] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-md capitalize transition-all duration-200 whitespace-nowrap ${
                  filter === f
                    ? isDark
                      ? 'bg-[#111111] text-white'
                      : 'bg-white text-black'
                    : isDark
                      ? 'text-[#555555] hover:text-white'
                      : 'text-gray-600 hover:text-black'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-12 text-center">
          <p className="text-[#444444] text-sm">
            {subscriptions.length === 0
              ? 'No subscriptions yet. Add your first one!'
              : 'No subscriptions match your search.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {visible.map((sub, i) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  allSubscriptions={subscriptions}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  index={i}
                  priceTrend={priceTrends?.[sub.id]}
                />
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border transition-all duration-200 ${
                  isDark
                    ? 'text-[#999999] hover:text-white border-[#1A1A1A] hover:border-[#333333]'
                    : 'text-gray-600 hover:text-black border-gray-300 hover:border-gray-400'
                }`}
              >
                {expanded ? (
                  <>
                    <FiChevronUp className="w-3.5 h-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-3.5 h-3.5" />
                    See more ({filtered.length - INITIAL_COUNT})
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
