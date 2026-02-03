'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-context'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { getSpendingByCategory } from '@/lib/supabase/queries'
import { SpendingPieChart } from '@/components/analytics/SpendingPieChart'
import { SpendingLineChart } from '@/components/analytics/SpendingLineChart'
import { InsightsCard } from '@/components/analytics/InsightsCard'
import { SavingsCalculator } from '@/components/analytics/SavingsCalculator'

export default function AnalyticsPage() {
  const { isDark } = useTheme()
  const { subscriptions, loading } = useSubscriptions()
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setCategoryLoading(true)
      const { data } = await getSpendingByCategory()
      if (data) setCategoryData(data)
      setCategoryLoading(false)
    }
    if (!loading) {
      fetchData()
    }
  }, [subscriptions, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${
          isDark ? 'border-[#222222] border-t-white' : 'border-gray-300 border-t-black'
        }`} />
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Analytics</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
          Understand your subscription spending patterns
        </p>
      </motion.div>

      {subscriptions.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${
          isDark
            ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className={`text-sm ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>
            Add some subscriptions to see your analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* Insights */}
          <div className="mb-6">
            <InsightsCard subscriptions={subscriptions} />
          </div>

          {/* Savings Calculator */}
          <div className="mb-6">
            <SavingsCalculator subscriptions={subscriptions} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {categoryLoading ? (
              <div className={`rounded-2xl p-6 flex items-center justify-center h-80 ${
                isDark
                  ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                  isDark ? 'border-[#222222] border-t-white' : 'border-gray-300 border-t-black'
                }`} />
              </div>
            ) : (
              <SpendingPieChart data={categoryData} />
            )}
            <SpendingLineChart subscriptions={subscriptions} />
          </div>
        </>
      )}
    </>
  )
}
