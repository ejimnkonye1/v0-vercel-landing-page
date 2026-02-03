'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiLoader } from 'react-icons/fi'
import { createSubscription, updateSubscription, deleteSubscription } from '@/lib/supabase/queries'
import { getSubscriptionIcon } from '@/lib/icons'
import type { Subscription, SubscriptionFormData, BillingCycle, SubscriptionStatus, CancellationDifficulty } from '@/lib/types'

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editSubscription?: Subscription | null
}

const suggestions = [
  'Netflix', 'Spotify', 'YouTube Premium', 'Disney+', 'Apple Music',
  'Amazon Prime', 'HBO Max', 'Hulu', 'Adobe Creative Cloud', 'Microsoft 365',
  'Google One', 'Notion', 'Slack', 'GitHub', 'Figma', 'Linear',
  'ChatGPT Plus', 'Dropbox', 'Discord Nitro', 'Twitch',
  'X', 'Instagram', 'TikTok', 'Telegram', 'LinkedIn',
  'Threads', 'Bluesky', 'Mastodon', 'Reddit', 'WhatsApp',
]

const categories = ['Entertainment', 'Productivity', 'Fitness', 'Developer Tools', 'Storage', 'Social Media', 'Other']

// Auto-categorization mapping for popular apps
const appCategoryMap: Record<string, string> = {
  // Entertainment
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'youtube premium': 'Entertainment',
  'youtube music': 'Entertainment',
  'disney+': 'Entertainment',
  'hbo max': 'Entertainment',
  'hulu': 'Entertainment',
  'apple tv+': 'Entertainment',
  'apple tv': 'Entertainment',
  'apple music': 'Entertainment',
  'amazon prime': 'Entertainment',
  'prime video': 'Entertainment',
  'twitch': 'Entertainment',
  'playstation plus': 'Entertainment',
  'ps plus': 'Entertainment',
  'xbox game pass': 'Entertainment',
  'game pass': 'Entertainment',
  'nintendo switch online': 'Entertainment',
  // Productivity
  'microsoft 365': 'Productivity',
  'google workspace': 'Productivity',
  'google one': 'Productivity',
  'notion': 'Productivity',
  'slack': 'Productivity',
  'dropbox': 'Storage',
  // Developer Tools
  'github': 'Developer Tools',
  'github copilot': 'Developer Tools',
  'linear': 'Developer Tools',
  'figma': 'Developer Tools',
  'chatgpt plus': 'Developer Tools',
  'openai': 'Developer Tools',
  // Design/Creative
  'adobe creative cloud': 'Productivity',
  'photoshop': 'Productivity',
  // Storage
  'icloud+': 'Storage',
  'icloud': 'Storage',
  'google drive': 'Storage',
  // Gaming
  'playstation': 'Entertainment',
  'xbox': 'Entertainment',
  'nintendo': 'Entertainment',
  // Social/Communication
  'discord nitro': 'Entertainment',
  'discord': 'Entertainment',
  // Social Media
  'x': 'Social Media',
  'twitter': 'Social Media',
  'instagram': 'Social Media',
  'tiktok': 'Social Media',
  'tik tok': 'Social Media',
  'telegram': 'Social Media',
  'whatsapp': 'Social Media',
  'linkedin': 'Social Media',
  'threads': 'Social Media',
  'bluesky': 'Social Media',
  'mastodon': 'Social Media',
  'reddit': 'Social Media',
}

function getAutoCategory(appName: string): string {
  const key = appName.toLowerCase().trim()
  return appCategoryMap[key] || 'Other'
}

export function AddSubscriptionModal({
  isOpen,
  onClose,
  onSaved,
  editSubscription,
}: AddSubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [formError, setFormError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Entertainment')
  const [cost, setCost] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [renewalDate, setRenewalDate] = useState('')
  const [status, setStatus] = useState<SubscriptionStatus>('active')
  const [trialEndDate, setTrialEndDate] = useState('')
  const [cancellationDifficulty, setCancellationDifficulty] = useState<CancellationDifficulty>('easy')
  const [cancellationLink, setCancellationLink] = useState('')
  const [notes, setNotes] = useState('')

  const isEditing = !!editSubscription

  useEffect(() => {
    if (editSubscription) {
      setName(editSubscription.name)
      setCategory(editSubscription.category)
      setCost(editSubscription.cost.toString())
      setBillingCycle(editSubscription.billing_cycle)
      setRenewalDate(editSubscription.renewal_date.split('T')[0])
      setStatus(editSubscription.status)
      setTrialEndDate(editSubscription.trial_end_date?.split('T')[0] || '')
      setCancellationDifficulty(editSubscription.cancellation_difficulty)
      setCancellationLink(editSubscription.cancellation_link || '')
      setNotes(editSubscription.notes || '')
    } else {
      resetForm()
    }
  }, [editSubscription, isOpen])

  const resetForm = () => {
    setName('')
    setCategory('Entertainment')
    setCost('')
    setBillingCycle('monthly')
    setRenewalDate('')
    setStatus('active')
    setTrialEndDate('')
    setCancellationDifficulty('easy')
    setCancellationLink('')
    setNotes('')
    setShowDeleteConfirm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    const formData: SubscriptionFormData = {
      name,
      category,
      cost: parseFloat(cost),
      billing_cycle: billingCycle,
      renewal_date: new Date(renewalDate).toISOString(),
      status,
      trial_end_date: trialEndDate ? new Date(trialEndDate).toISOString() : null,
      cancellation_difficulty: cancellationDifficulty,
      cancellation_link: cancellationLink || null,
      logo_identifier: name.toLowerCase().trim(),
      notes: notes || null,
    }

    let result
    if (isEditing) {
      result = await updateSubscription(editSubscription.id, formData)
    } else {
      result = await createSubscription(formData)
    }

    setLoading(false)

    if (result.error) {
      setFormError(typeof result.error === 'object' && 'message' in result.error ? result.error.message : 'Something went wrong')
      return
    }

    onSaved()
    onClose()
    resetForm()
  }

  const handleDelete = async () => {
    if (!editSubscription) return
    setFormError('')
    setDeleting(true)
    const { error } = await deleteSubscription(editSubscription.id)
    setDeleting(false)

    if (error) {
      setFormError(typeof error === 'object' && 'message' in error ? error.message : 'Failed to delete')
      return
    }

    onSaved()
    onClose()
    resetForm()
  }

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(name.toLowerCase()) && name.length > 0
  )

  const PreviewIcon = getSubscriptionIcon(name)

  return (
    <AnimatePresence>
      {isOpen && (
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#333333 transparent',
            }}
          >
            <style>{`
              .scroll-smooth::-webkit-scrollbar {
                width: 6px;
              }
              .scroll-smooth::-webkit-scrollbar-track {
                background: transparent;
              }
              .scroll-smooth::-webkit-scrollbar-thumb {
                background: #333333;
                border-radius: 3px;
              }
              .scroll-smooth::-webkit-scrollbar-thumb:hover {
                background: #555555;
              }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#1A1A1A] px-6 py-5 flex items-center justify-between z-10 backdrop-blur-sm bg-[#0A0A0A]/95">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#2A2A2A] rounded-xl flex items-center justify-center">
                  <PreviewIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {isEditing ? 'Edit Subscription' : 'Add Subscription'}
                  </h2>
                  <p className="text-[#666666] text-xs">Manage your subscription details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#555555] hover:text-white p-2 rounded-lg hover:bg-[#111111] transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                >
                  <p className="text-red-400 text-sm font-medium">{formError}</p>
                </motion.div>
              )}

              {/* Section 1: Basic Info */}
              <div className="space-y-5">
                <div className="px-3 pb-3 border-b border-[#1A1A1A]">
                  <h3 className="text-[#999999] text-xs font-bold uppercase tracking-widest">Basic Information</h3>
                </div>

                {/* Name with autocomplete */}
                <div className="relative">
                  <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                    Subscription Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="e.g., Netflix, Spotify"
                    required
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm placeholder:text-[#444444] focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all"
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1A1A1A] rounded-xl overflow-hidden z-20 shadow-2xl backdrop-blur-sm"
                    >
                      {filteredSuggestions.slice(0, 6).map((suggestion) => {
                        const SuggIcon = getSubscriptionIcon(suggestion)
                        return (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={() => {
                              setName(suggestion)
                              setCategory(getAutoCategory(suggestion))
                              setShowSuggestions(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1A1A1A] transition-colors border-b border-[#0D0D0D] last:border-b-0"
                          >
                            <SuggIcon className="w-4 h-4 text-[#666666]" />
                            <span className="text-white text-sm flex-1">{suggestion}</span>
                            <span className="text-[#555555] text-xs bg-[#0D0D0D] px-2.5 py-1 rounded-full">{getAutoCategory(suggestion)}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </div>

                {/* Category and Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Cost <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] text-sm font-medium">$</span>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl pl-8 pr-4 py-3.5 text-sm placeholder:text-[#444444] focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Billing Details */}
              <div className="space-y-5">
                <div className="px-3 pb-3 border-b border-[#1A1A1A]">
                  <h3 className="text-[#999999] text-xs font-bold uppercase tracking-widest">Billing Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Billing Cycle <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Renewal Date and Trial End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Renewal Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      required
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all [color-scheme:dark]"
                    />
                  </div>
                  {status === 'trial' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                        Trial End Date
                      </label>
                      <input
                        type="date"
                        value={trialEndDate}
                        onChange={(e) => setTrialEndDate(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all [color-scheme:dark]"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Section 3: Cancellation & Notes */}
              <div className="space-y-5">
                <div className="px-3 pb-3 border-b border-[#1A1A1A]">
                  <h3 className="text-[#999999] text-xs font-bold uppercase tracking-widest">Additional Details</h3>
                </div>

                {/* Cancellation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Cancellation Difficulty
                    </label>
                    <select
                      value={cancellationDifficulty}
                      onChange={(e) =>
                        setCancellationDifficulty(e.target.value as CancellationDifficulty)
                      }
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                      Cancellation Link
                    </label>
                    <input
                      type="url"
                      value={cancellationLink}
                      onChange={(e) => setCancellationLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm placeholder:text-[#444444] focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[#CCCCCC] text-sm font-medium mb-3">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this subscription..."
                    rows={3}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-xl px-4 py-3.5 text-sm placeholder:text-[#444444] focus:border-[#444444] focus:outline-none focus:ring-1 focus:ring-[#333333] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]">
                {isEditing ? (
                  <div>
                    {showDeleteConfirm ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[#666666] text-xs font-medium">Delete this subscription?</span>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="text-white text-xs px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="text-[#555555] text-xs px-4 py-2 border border-[#1A1A1A] rounded-lg hover:border-[#333333] hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-[#555555] text-xs hover:text-red-400 transition-colors font-medium"
                      >
                        Delete subscription
                      </button>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[#CCCCCC] text-sm font-medium px-6 py-2.5 border border-[#1A1A1A] rounded-xl hover:border-[#333333] hover:bg-[#0D0D0D] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      'Save Changes'
                    ) : (
                      'Add Subscription'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
