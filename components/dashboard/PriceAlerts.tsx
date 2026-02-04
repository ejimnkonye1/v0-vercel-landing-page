'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiX,
  FiUsers,
  FiClock,
} from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import type { PriceAlert } from '@/lib/types'

interface PriceChange {
  id: string
  old_price: number
  new_price: number
  billing_cycle: string
  changed_at: string
  subscription: { name: string }
}

export function PriceAlerts() {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [recentChanges, setRecentChanges] = useState<PriceChange[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPriceData = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in')
        setLoading(false)
        return
      }

      const response = await fetch('/api/price-changes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setAlerts(data.alerts || [])
        setRecentChanges(data.recentChanges || [])
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPriceData()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const overpayingAlerts = alerts.filter(a => a.alertType === 'overpaying')
  const hasAlerts = overpayingAlerts.length > 0

  if (loading) {
    return (
      <div className={`rounded-2xl p-5 border ${
        isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <FiDollarSign className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
            Price Monitor
          </h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
            isDark ? 'border-[#222222] border-t-white' : 'border-gray-300 border-t-black'
          }`} />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#333333]'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiDollarSign className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              Price Monitor
            </h3>
          </div>
          {hasAlerts && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isDark ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-100 text-orange-700'
            }`}>
              {overpayingAlerts.length} alert{overpayingAlerts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {hasAlerts ? (
          <div className={`p-3 rounded-xl mb-3 ${
            isDark ? 'bg-orange-400/10 border border-orange-400/30' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-2">
              <FiTrendingUp className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <p className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                You may be overpaying for {overpayingAlerts.length} subscription{overpayingAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ) : (
          <p className={`text-xs mb-3 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
            Track price changes and compare with community data.
          </p>
        )}

        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          View Price Insights
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl border ${
                isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-gray-300'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 flex items-center justify-between border-b ${
                isDark ? 'border-[#1A1A1A]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isDark ? 'bg-orange-400/20' : 'bg-orange-100'
                  }`}>
                    <FiDollarSign className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                      Price Monitor
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                      Crowdsourced price insights
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {error ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FiAlertCircle className={`w-10 h-10 mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <p className={`text-sm ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>{error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Price Alerts */}
                    {overpayingAlerts.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-black'
                        }`}>
                          <FiTrendingUp className="w-4 h-4 text-orange-400" />
                          Price Alerts
                        </h3>
                        <div className="space-y-3">
                          {overpayingAlerts.map((alert) => (
                            <div
                              key={alert.subscriptionId}
                              className={`p-4 rounded-xl border ${
                                isDark ? 'bg-orange-400/5 border-orange-400/20' : 'bg-orange-50 border-orange-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                  {alert.subscriptionName}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  isDark ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  +{alert.percentageDiff}% above avg
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className={isDark ? 'text-[#666666]' : 'text-gray-500'}>Your price</p>
                                  <p className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {formatAmount(alert.yourPrice)}/{alert.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                  </p>
                                </div>
                                <div>
                                  <p className={isDark ? 'text-[#666666]' : 'text-gray-500'}>Community avg</p>
                                  <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    {formatAmount(alert.communityAvgPrice)}/{alert.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                  </p>
                                </div>
                              </div>
                              <p className={`text-xs mt-2 ${isDark ? 'text-[#555555]' : 'text-gray-400'}`}>
                                Based on {alert.reportCount} user reports • Range: {formatAmount(alert.communityMinPrice)} - {formatAmount(alert.communityMaxPrice)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Alerts */}
                    {overpayingAlerts.length === 0 && (
                      <div className={`p-4 rounded-xl ${
                        isDark ? 'bg-green-400/10 border border-green-400/30' : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <FiTrendingDown className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                              Great news!
                            </p>
                            <p className={`text-xs ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
                              Your subscription prices are in line with the community.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Price Changes */}
                    {recentChanges.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-black'
                        }`}>
                          <FiClock className="w-4 h-4 text-blue-400" />
                          Your Recent Price Changes
                        </h3>
                        <div className="space-y-2">
                          {recentChanges.map((change) => {
                            const increased = change.new_price > change.old_price
                            const diff = Math.abs(change.new_price - change.old_price)
                            return (
                              <div
                                key={change.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${
                                  isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                                    {change.subscription?.name || 'Unknown'}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                                    {formatDate(change.changed_at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    {increased ? (
                                      <FiTrendingUp className="w-3 h-3 text-red-400" />
                                    ) : (
                                      <FiTrendingDown className="w-3 h-3 text-green-400" />
                                    )}
                                    <span className={`text-xs font-medium ${
                                      increased
                                        ? (isDark ? 'text-red-400' : 'text-red-600')
                                        : (isDark ? 'text-green-400' : 'text-green-600')
                                    }`}>
                                      {increased ? '+' : '-'}{formatAmount(diff)}
                                    </span>
                                  </div>
                                  <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-400'}`}>
                                    {formatAmount(change.old_price)} → {formatAmount(change.new_price)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div className={`p-4 rounded-xl ${
                      isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <FiUsers className={`w-4 h-4 mt-0.5 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
                        <div>
                          <p className={`text-xs font-medium mb-1 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                            How it works
                          </p>
                          <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                            Price data is crowdsourced from SubTracker users. When you add or update subscriptions,
                            prices are anonymously aggregated to help everyone find the best deals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
