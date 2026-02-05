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
  FiBarChart2,
  FiMessageSquare,
} from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import { PriceHistoryChart } from './PriceHistoryChart'
import { CommunityPriceReportForm } from './CommunityPriceReportForm'
import type { PriceAlert, PriceHistoryDataPoint, ServicePriceTimeline } from '@/lib/types'

interface PriceChange {
  id: string
  old_price: number
  new_price: number
  billing_cycle: string
  changed_at: string
  subscription: { name: string }
}

type TabId = 'alerts' | 'history' | 'community' | 'timeline'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'alerts', label: 'Alerts', icon: <FiTrendingUp className="w-3.5 h-3.5" /> },
  { id: 'history', label: 'Price History', icon: <FiBarChart2 className="w-3.5 h-3.5" /> },
  { id: 'community', label: 'Community', icon: <FiMessageSquare className="w-3.5 h-3.5" /> },
  { id: 'timeline', label: 'Timeline', icon: <FiClock className="w-3.5 h-3.5" /> },
]

export function PriceAlerts() {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [recentChanges, setRecentChanges] = useState<PriceChange[]>([])
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistoryDataPoint[]>>({})
  const [serviceTimelines, setServiceTimelines] = useState<ServicePriceTimeline[]>([])
  const [subscriptions, setSubscriptions] = useState<{ id: string; name: string }[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('alerts')
  const [selectedSub, setSelectedSub] = useState<string>('')

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
        setPriceHistory(data.priceHistory || {})
        setServiceTimelines(data.serviceTimelines || [])

        // Build subscription list from price history keys
        const subs = Object.keys(data.priceHistory || {}).map(id => {
          const alert = (data.alerts || []).find((a: PriceAlert) => a.subscriptionId === id)
          const timeline = (data.serviceTimelines || []).find((t: ServicePriceTimeline) =>
            (data.recentChanges || []).some((c: PriceChange) => c.subscription?.name === t.serviceName)
          )
          return {
            id,
            name: alert?.subscriptionName || timeline?.serviceName || id,
          }
        })
        setSubscriptions(subs)
        if (subs.length > 0 && !selectedSub) {
          setSelectedSub(subs[0].id)
        }
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
              className={`relative rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border ${
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

              {/* Tabs */}
              <div className={`px-6 pt-3 border-b ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
                <div className="flex gap-1 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? isDark
                            ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5'
                            : 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                          : isDark
                            ? 'text-[#666666] hover:text-[#999999]'
                            : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {error ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FiAlertCircle className={`w-10 h-10 mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <p className={`text-sm ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                      <div className="space-y-6">
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
                                Price data is crowdsourced from SubWise users. When you add or update subscriptions,
                                prices are anonymously aggregated to help everyone find the best deals.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price History Tab */}
                    {activeTab === 'history' && (
                      <div className="space-y-4">
                        {subscriptions.length > 0 ? (
                          <>
                            <div>
                              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                                Select Subscription
                              </label>
                              <select
                                value={selectedSub}
                                onChange={(e) => setSelectedSub(e.target.value)}
                                className={`w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
                                  isDark
                                    ? 'bg-[#0D0D0D] border border-[#1A1A1A] text-white focus:border-[#333333]'
                                    : 'bg-gray-50 border border-gray-200 text-black focus:border-gray-400'
                                }`}
                              >
                                {subscriptions.map((sub) => (
                                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                              </select>
                            </div>
                            {selectedSub && priceHistory[selectedSub] && (
                              <PriceHistoryChart
                                data={priceHistory[selectedSub]}
                                subscriptionName={subscriptions.find(s => s.id === selectedSub)?.name || ''}
                              />
                            )}
                          </>
                        ) : (
                          <div className={`p-6 rounded-xl text-center ${
                            isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                              No price history available yet. Price changes will be tracked as you update your subscriptions.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Community Tab */}
                    {activeTab === 'community' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                            isDark ? 'text-white' : 'text-black'
                          }`}>
                            <FiMessageSquare className="w-4 h-4 text-orange-400" />
                            Report a Price
                          </h3>
                          <p className={`text-xs mb-4 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                            Help the community by sharing what you pay for subscription services.
                          </p>
                          <CommunityPriceReportForm />
                        </div>
                      </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        {serviceTimelines.length > 0 ? (
                          serviceTimelines.map((timeline) => (
                            <div key={timeline.serviceName}>
                              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                                {timeline.serviceName}
                              </h3>
                              <div className="relative pl-6">
                                <div className={`absolute left-2 top-0 bottom-0 w-px ${
                                  isDark ? 'bg-[#222222]' : 'bg-gray-300'
                                }`} />
                                {timeline.changes.map((change, i) => {
                                  const increased = change.newPrice > change.oldPrice
                                  return (
                                    <div key={i} className="relative mb-4 last:mb-0">
                                      <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                                        increased
                                          ? isDark ? 'bg-red-400 border-red-400/50' : 'bg-red-500 border-red-300'
                                          : isDark ? 'bg-green-400 border-green-400/50' : 'bg-green-500 border-green-300'
                                      }`} />
                                      <div className={`p-3 rounded-xl ${
                                        isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                                      }`}>
                                        <div className="flex items-center justify-between mb-1">
                                          <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                                            {formatDate(change.date)}
                                          </p>
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            increased
                                              ? isDark ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-700'
                                              : isDark ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-700'
                                          }`}>
                                            {increased ? '+' : ''}{change.changePercent}%
                                          </span>
                                        </div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                                          {formatAmount(change.oldPrice)} → {formatAmount(change.newPrice)}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={`p-6 rounded-xl text-center ${
                            isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <FiClock className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-[#333333]' : 'text-gray-300'}`} />
                            <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                              No price timeline data yet. Updates will appear here as prices change over time.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
