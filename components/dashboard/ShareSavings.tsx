'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShare2, FiX, FiTwitter, FiLinkedin, FiCopy, FiDownload, FiCheck } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'

interface ShareSavingsProps {
  totalSavings: number
  subscriptionCount: number
  cancelledCount: number
}

export function ShareSavings({ totalSavings, subscriptionCount, cancelledCount }: ShareSavingsProps) {
  const { isDark } = useTheme()
  const { formatAmount, currency } = useCurrency()
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const shareText = `I saved ${formatAmount(totalSavings)} this year by tracking my subscriptions with SubWise! Managing ${subscriptionCount} active subscriptions and cancelled ${cancelledCount} I didn't need.`

  const shareToTwitter = () => {
    const url = encodeURIComponent('https://subtracker.app')
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent('https://subtracker.app')
    const text = encodeURIComponent(shareText)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const downloadImage = useCallback(async () => {
    if (!cardRef.current) return

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        width: 600,
        height: 315,
      })

      const link = document.createElement('a')
      link.download = 'subtracker-savings.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      console.error('Failed to generate image')
    }
  }, [])

  if (totalSavings <= 0) {
    return null
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-all hover:scale-105 ${
          isDark
            ? 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white hover:border-[#333333]'
            : 'bg-white border-gray-200 text-gray-600 hover:text-black hover:border-gray-400'
        }`}
      >
        <FiShare2 className="w-3.5 h-3.5" />
        Share Your Savings
      </motion.button>

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

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border ${
                isDark
                  ? 'bg-[#0A0A0A] border-[#1A1A1A]'
                  : 'bg-white border-gray-300'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 flex items-center justify-between border-b ${
                isDark
                  ? 'border-[#1A1A1A]'
                  : 'border-gray-200'
              }`}>
                <div>
                  <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                    Share Your Savings
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                    Let the world know about your smart money moves
                  </p>
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

              {/* Card Preview */}
              <div className="p-6">
                <div
                  ref={cardRef}
                  className="w-full aspect-[1200/630] bg-black rounded-xl overflow-hidden relative p-8 flex flex-col justify-between"
                  style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }} />
                  </div>

                  {/* Logo */}
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">S</span>
                    </div>
                    <span className="text-white font-semibold">SubWise</span>
                  </div>

                  {/* Main content */}
                  <div className="relative z-10 text-center flex-1 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-2">I saved</p>
                    <p className="text-white text-5xl font-bold mb-2">
                      {formatAmount(totalSavings)}
                    </p>
                    <p className="text-gray-400 text-sm">this year on subscriptions</p>
                  </div>

                  {/* Stats */}
                  <div className="relative z-10 flex justify-center gap-8">
                    <div className="text-center">
                      <p className="text-white text-xl font-bold">{subscriptionCount}</p>
                      <p className="text-gray-500 text-xs">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xl font-bold">{cancelledCount}</p>
                      <p className="text-gray-500 text-xs">Cancelled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share buttons */}
              <div className={`px-6 py-4 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={shareToTwitter}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-[#111111] border border-[#1A1A1A] text-white hover:bg-[#1A1A1A]'
                        : 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200'
                    }`}
                  >
                    <FiTwitter className="w-4 h-4" />
                    Twitter
                  </button>
                  <button
                    onClick={shareToLinkedIn}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-[#111111] border border-[#1A1A1A] text-white hover:bg-[#1A1A1A]'
                        : 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200'
                    }`}
                  >
                    <FiLinkedin className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-[#111111] border border-[#1A1A1A] text-white hover:bg-[#1A1A1A]'
                        : 'bg-gray-100 border border-gray-200 text-black hover:bg-gray-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-4 h-4 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4" />
                        Copy Text
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadImage}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    <FiDownload className="w-4 h-4" />
                    Download Image
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
