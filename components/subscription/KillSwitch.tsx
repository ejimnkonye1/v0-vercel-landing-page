'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCopy, FiExternalLink, FiMail, FiCheck } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import type { Subscription } from '@/lib/types'

interface KillSwitchProps {
  subscription: Subscription
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-[#1A1A1A] text-[#CCCCCC]',
  medium: 'bg-[#1A1A1A] text-[#999999]',
  hard: 'bg-[#1A1A1A] text-[#666666]',
}

const difficultyStylesLight: Record<string, string> = {
  easy: 'bg-gray-200 text-gray-700',
  medium: 'bg-gray-200 text-gray-600',
  hard: 'bg-gray-100 text-gray-600',
}

function generateCancellationEmail(sub: Subscription): {
  subject: string
  body: string
} {
  return {
    subject: `Cancellation Request - ${sub.name}`,
    body: `Dear ${sub.name} Support Team,

I am writing to request the cancellation of my ${sub.name} subscription effective immediately.

Account Details:
- Service: ${sub.name}
- Billing Cycle: ${sub.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
- Current Cost: $${sub.cost.toFixed(2)}/${sub.billing_cycle === 'monthly' ? 'month' : 'year'}

Please process this cancellation and confirm the following:
1. The exact date my subscription will end
2. Whether I will receive a prorated refund for the remaining period
3. Confirmation that no further charges will be made

Please send written confirmation of this cancellation to this email address.

Thank you for your prompt attention to this matter.

Best regards`,
  }
}

export function KillSwitch({ subscription }: KillSwitchProps) {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(false)
  const email = generateCancellationEmail(subscription)

  const handleCopy = async () => {
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`
    await navigator.clipboard.writeText(fullEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    window.open(url, '_blank')
  }

  const handleOpenOutlook = () => {
    const url = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`rounded-2xl p-6 border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <h3 className={`font-semibold text-base mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Ready to Cancel?</h3>
      <p className={`text-xs mb-6 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
        Use the Kill Switch to quickly cancel this subscription
      </p>

      {/* Difficulty */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-600'}`}>Cancellation Difficulty:</span>
        <span
          className={`text-xs px-3 py-1 rounded-full capitalize ${
            isDark
              ? (difficultyStyles[subscription.cancellation_difficulty] || difficultyStyles.easy)
              : (difficultyStylesLight[subscription.cancellation_difficulty] || difficultyStylesLight.easy)
          }`}
        >
          {subscription.cancellation_difficulty}
        </span>
      </div>

      {/* Direct cancellation link */}
      {subscription.cancellation_link && (
        <a
          href={subscription.cancellation_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full font-medium rounded-lg px-4 py-3 transition-all duration-200 mb-4 ${
            isDark
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          <FiExternalLink className="w-4 h-4" />
          Go to Cancellation Page
        </a>
      )}

      {/* Email template */}
      <div className={`rounded-xl overflow-hidden mb-4 border ${
        isDark
          ? 'border-[#1A1A1A]'
          : 'border-gray-200'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark
            ? 'bg-[#0D0D0D] border-[#1A1A1A]'
            : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <FiMail className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>Cancellation Email</span>
          </div>
          <span className={`text-xs ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>Auto-generated</span>
        </div>
        <div className="px-4 py-3">
          <p className={`text-xs mb-2 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
            <span className={isDark ? 'text-[#555555]' : 'text-gray-600'}>Subject:</span> {email.subject}
          </p>
          <pre className={`text-xs whitespace-pre-wrap font-sans leading-relaxed ${isDark ? 'text-[#999999]' : 'text-gray-700'}`}>
            {email.body}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 text-sm rounded-lg px-4 py-2.5 transition-all duration-200 border ${
            isDark
              ? 'border-[#1A1A1A] text-white hover:border-[#333333] hover:bg-[#111111]'
              : 'border-gray-300 text-black hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" />
              Copy Email
            </>
          )}
        </button>
        <button
          onClick={handleOpenGmail}
          className={`flex-1 flex items-center justify-center gap-2 text-sm rounded-lg px-4 py-2.5 transition-all duration-200 border ${
            isDark
              ? 'border-[#1A1A1A] text-white hover:border-[#333333] hover:bg-[#111111]'
              : 'border-gray-300 text-black hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          Open in Gmail
        </button>
        <button
          onClick={handleOpenOutlook}
          className={`flex-1 flex items-center justify-center gap-2 text-sm rounded-lg px-4 py-2.5 transition-all duration-200 border ${
            isDark
              ? 'border-[#1A1A1A] text-white hover:border-[#333333] hover:bg-[#111111]'
              : 'border-gray-300 text-black hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          Outlook
        </button>
      </div>
    </motion.div>
  )
}
