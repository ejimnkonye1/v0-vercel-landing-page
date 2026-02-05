'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGlobe,
  FiX,
  FiDownload,
  FiKey,
  FiCheck,
  FiCopy,
  FiAlertCircle,
} from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { createClient } from '@/lib/supabase/client'

export function ExtensionStatus() {
  const { isDark } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGetToken = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      setToken(session.access_token)
    }
  }

  const handleCopyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
            <FiGlobe className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              Browser Extension
            </h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
          }`}>
            New
          </span>
        </div>
        <p className={`text-xs mb-3 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
          Automatically detect subscriptions as you browse the web.
        </p>
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
          }`}
        >
          <FiGlobe className="w-4 h-4" />
          View Details
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
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-cyan-400/20' : 'bg-cyan-100'}`}>
                    <FiGlobe className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                      Browser Extension
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>
                      Auto-detect subscriptions while browsing
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
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
                {/* Installation */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    <FiDownload className="w-4 h-4 text-cyan-400" />
                    Installation
                  </h3>
                  <div className={`p-4 rounded-xl space-y-3 ${
                    isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}>1</span>
                      <p className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                        Download the extension files from the <code className={`px-1 rounded ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>browser-extension/</code> folder
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}>2</span>
                      <p className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                        Go to <code className={`px-1 rounded ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>chrome://extensions</code> and enable Developer Mode
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}>3</span>
                      <p className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                        Click &quot;Load unpacked&quot; and select the <code className={`px-1 rounded ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}>browser-extension</code> folder
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}>4</span>
                      <p className={`text-xs ${isDark ? 'text-[#CCCCCC]' : 'text-gray-700'}`}>
                        Copy your API token below and paste it into the extension popup settings
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Token */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    <FiKey className="w-4 h-4 text-cyan-400" />
                    API Token
                  </h3>
                  {!token ? (
                    <button
                      onClick={handleGetToken}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                      }`}
                    >
                      Generate API Token
                    </button>
                  ) : (
                    <div className={`p-3 rounded-xl flex items-center gap-2 ${
                      isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <code className={`text-xs flex-1 overflow-hidden text-ellipsis ${
                        isDark ? 'text-[#888888]' : 'text-gray-600'
                      }`}>
                        {token.substring(0, 30)}...
                      </code>
                      <button
                        onClick={handleCopyToken}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                          copied
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : isDark ? 'text-cyan-400 hover:bg-[#1A1A1A]' : 'text-cyan-600 hover:bg-gray-100'
                        }`}
                      >
                        {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-[#0D0D0D] border border-[#1A1A1A]' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <FiGlobe className={`w-4 h-4 mt-0.5 ${isDark ? 'text-[#666666]' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                        How it works
                      </p>
                      <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                        The extension monitors the websites you visit and matches them against 25+ known subscription services.
                        When a subscription service is detected, you can add it to SubWise with one click.
                        No browsing data is sent to our servers — detection happens entirely in your browser.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    <FiAlertCircle className="w-4 h-4 text-cyan-400" />
                    Troubleshooting
                  </h3>
                  <div className={`space-y-2 text-xs ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
                    <p>• Make sure the extension is enabled in Chrome</p>
                    <p>• Verify your API token is correctly pasted in the extension popup</p>
                    <p>• The extension detects services when you visit their websites</p>
                    <p>• Try refreshing the page if a service is not detected</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
