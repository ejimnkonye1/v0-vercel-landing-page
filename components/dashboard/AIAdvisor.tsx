'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiZap,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiTrendingDown,
  FiStar,
} from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import { calculatePortfolioHealth } from '@/lib/healthScore'
import type { Subscription, AIAdvisorAnalysis, AIInsightType, AIRecommendationAction } from '@/lib/types'

interface AIAdvisorProps {
  subscriptions: Subscription[]
  totalMonthlySpend: number
  totalYearlyProjection: number
}

export function AIAdvisor({ subscriptions, totalMonthlySpend, totalYearlyProjection }: AIAdvisorProps) {
  const { isDark } = useTheme()
  const { formatAmount, currency } = useCurrency()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AIAdvisorAnalysis | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)

  const activeCount = subscriptions.filter(s => s.status === 'active').length

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current)
    }
  }, [cooldown])

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Please sign in to use AI Advisor')
        setLoading(false)
        return
      }

      const healthData = calculatePortfolioHealth(subscriptions)

      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptions,
          totalMonthlySpend,
          totalYearlyProjection,
          healthData,
          currency,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to get AI insights')
        if (data.retryAfter) {
          setCooldown(data.retryAfter)
        }
      } else {
        setAnalysis(data.analysis)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setModalOpen(true)
    if (!analysis && !loading) {
      fetchAnalysis()
    }
  }

  const getInsightIcon = (type: AIInsightType) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <FiAlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-400" />
      case 'info':
      default:
        return <FiInfo className="w-4 h-4 text-blue-400" />
    }
  }

  const getInsightBgColor = (type: AIInsightType) => {
    switch (type) {
      case 'success':
        return isDark ? 'bg-green-400/10 border-green-400/30' : 'bg-green-50 border-green-200'
      case 'warning':
        return isDark ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-yellow-50 border-yellow-200'
      case 'error':
        return isDark ? 'bg-red-400/10 border-red-400/30' : 'bg-red-50 border-red-200'
      case 'info':
      default:
        return isDark ? 'bg-blue-400/10 border-blue-400/30' : 'bg-blue-50 border-blue-200'
    }
  }

  const getActionBadge = (action: AIRecommendationAction) => {
    const styles = {
      keep: isDark ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-700',
      cancel: isDark ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-700',
      downgrade: isDark ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      review: isDark ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    }
    return styles[action]
  }

  if (activeCount === 0) {
    return null
  }

  return (
    <>
      {/* Trigger Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#333333]'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={handleOpenModal}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiZap className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              AI Subscription Advisor
            </h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDark ? 'bg-purple-400/20 text-purple-400' : 'bg-purple-100 text-purple-700'
          }`}>
            Beta
          </span>
        </div>
        <p className={`text-xs mb-3 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
          Get personalized insights and recommendations to optimize your subscription spending.
        </p>
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <FiZap className="w-4 h-4" />
          Get AI Insights
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border ${
                isDark
                  ? 'bg-[#0A0A0A] border-[#1A1A1A]'
                  : 'bg-white border-gray-300'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 flex items-center justify-between border-b ${
                isDark ? 'border-[#1A1A1A]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isDark ? 'bg-purple-400/20' : 'bg-purple-100'
                  }`}>
                    <FiZap className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                      AI Subscription Insights
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                      Personalized recommendations powered by AI
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
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className={`w-8 h-8 border-2 rounded-full animate-spin mb-4 ${
                      isDark ? 'border-[#222222] border-t-purple-400' : 'border-gray-300 border-t-purple-600'
                    }`} />
                    <p className={`text-sm ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                      Analyzing your subscriptions...
                    </p>
                  </div>
                )}

                {error && !loading && (
                  <div className={`flex flex-col items-center justify-center py-12 text-center ${
                    cooldown > 0 ? (isDark ? 'text-yellow-400' : 'text-yellow-600') : (isDark ? 'text-red-400' : 'text-red-600')
                  }`}>
                    <FiAlertCircle className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium mb-2">
                      {cooldown > 0 ? 'Rate Limited' : 'Failed to get insights'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                      {cooldown > 0 ? `Please wait ${cooldown}s before trying again` : error}
                    </p>
                    <button
                      onClick={fetchAnalysis}
                      disabled={cooldown > 0}
                      className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        cooldown > 0
                          ? 'bg-[#111111] text-[#555555] cursor-not-allowed'
                          : isDark
                            ? 'bg-[#111111] text-white hover:bg-[#1A1A1A]'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                    >
                      {cooldown > 0 ? `Wait ${cooldown}s` : 'Try Again'}
                    </button>
                  </div>
                )}

                {analysis && !loading && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className={`p-4 rounded-xl ${
                      isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <p className={`text-sm ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                        {analysis.summary}
                      </p>
                    </div>

                    {/* Potential Savings */}
                    {analysis.totalPotentialSavings > 0 && (
                      <div className={`flex items-center gap-4 p-4 rounded-xl ${
                        isDark ? 'bg-green-400/10 border border-green-400/30' : 'bg-green-50 border border-green-200'
                      }`}>
                        <FiTrendingDown className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <div>
                          <p className={`text-xs ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
                            Estimated Potential Savings
                          </p>
                          <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            {formatAmount(analysis.totalPotentialSavings)}/mo
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {analysis.insights.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                          Key Insights
                        </h3>
                        <div className="space-y-2">
                          {analysis.insights.map((insight, index) => (
                            <div
                              key={index}
                              className={`flex items-start gap-3 p-3 rounded-xl border ${getInsightBgColor(insight.type)}`}
                            >
                              {getInsightIcon(insight.type)}
                              <p className={`text-sm ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                                {insight.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                          Recommendations
                        </h3>
                        <div className="space-y-3">
                          {analysis.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border ${
                                isDark ? 'bg-[#0D0D0D] border-[#1A1A1A]' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                  {rec.subscriptionName}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${getActionBadge(rec.action)}`}>
                                  {rec.action}
                                </span>
                              </div>
                              <p className={`text-xs mb-2 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                                {rec.reason}
                              </p>
                              {rec.potentialSavings > 0 && (
                                <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  Potential savings: {formatAmount(rec.potentialSavings)}/mo
                                </p>
                              )}
                              {rec.alternative && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                  Alternative: {rec.alternative}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {analysis.tips.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                          <FiStar className="w-4 h-4 text-yellow-400" />
                          Pro Tips
                        </h3>
                        <ul className="space-y-2">
                          {analysis.tips.map((tip, index) => (
                            <li
                              key={index}
                              className={`flex items-start gap-2 text-xs ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}
                            >
                              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isDark ? 'bg-yellow-400' : 'bg-yellow-500'
                              }`} />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Refresh Button */}
                    <button
                      onClick={fetchAnalysis}
                      disabled={cooldown > 0 || loading}
                      className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                        cooldown > 0 || loading
                          ? 'bg-[#111111] border border-[#1A1A1A] text-[#555555] cursor-not-allowed'
                          : isDark
                            ? 'bg-[#111111] border border-[#1A1A1A] text-[#888888] hover:text-white hover:border-[#333333]'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                      }`}
                    >
                      {cooldown > 0 ? `Wait ${cooldown}s to refresh` : 'Refresh Analysis'}
                    </button>
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
