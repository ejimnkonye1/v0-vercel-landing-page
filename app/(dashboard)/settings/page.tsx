'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiLoader, FiDownload, FiUpload, FiAlertTriangle, FiSun, FiMoon } from 'react-icons/fi'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useTheme } from '@/lib/theme-context'
import { updatePassword } from '@/lib/supabase/auth'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { usePreferences } from '@/hooks/usePreferences'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CURRENCIES } from '@/lib/currency'
import { ImportModal } from '@/components/dashboard/ImportModal'
import type { Currency } from '@/lib/types'

export default function SettingsPage() {
  const { user } = useAuthContext()
  const { subscriptions } = useSubscriptions()
  const { preferences, loading: prefsLoading, saving: prefsSaving, updatePreferences } = usePreferences()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [budgetInputValue, setBudgetInputValue] = useState('')

  // Sync budget input with preferences
  useEffect(() => {
    if (preferences.monthly_budget !== null && preferences.monthly_budget !== undefined) {
      setBudgetInputValue(preferences.monthly_budget.toString())
    } else {
      setBudgetInputValue('')
    }
  }, [preferences.monthly_budget])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    const { error } = await updatePassword(newPassword)

    if (error) {
      setPasswordMessage(error.message)
    } else {
      setPasswordMessage('Password updated successfully')
      setNewPassword('')
      setConfirmNewPassword('')
    }
    setPasswordLoading(false)
  }

  const handleExport = () => {
    const data = JSON.stringify(subscriptions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtracker-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    const supabase = createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      await supabase.from('user_preferences').delete().eq('user_id', currentUser.id)
      await supabase.from('reminders').delete().eq('user_id', currentUser.id)
      await supabase.from('subscriptions').delete().eq('user_id', currentUser.id)
    }

    await supabase.auth.signOut()
    setDeleteLoading(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Settings</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Theme</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <FiMoon className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-gray-600'}`} />
              ) : (
                <FiSun className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              )}
              <div>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                  Toggle between dark and light theme
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleTheme()}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </motion.div>
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Profile</h3>
          <div>
            <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
              isDark ? 'text-[#999999]' : 'text-gray-600'
            }`}>
              Email
            </label>
            <div className={`rounded-lg px-4 py-3 text-sm ${
              isDark
                ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-[#666666]'
                : 'bg-white border border-gray-300 text-gray-600'
            }`}>
              {user?.email || 'Loading...'}
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Notification Preferences</h3>

          {prefsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <FiLoader className={`w-4 h-4 animate-spin ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              <span className={`text-sm ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Email reminders for renewals */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Email reminders for renewals</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    Receive email before subscription renewals
                  </p>
                </div>
                <Switch
                  checked={preferences.email_reminders_renewal}
                  onCheckedChange={(checked: boolean) =>
                    updatePreferences({ email_reminders_renewal: checked })
                  }
                  disabled={prefsSaving}
                />
              </div>

              {/* Email reminders for trials */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Email reminders for trials ending</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    Receive email before trial periods expire
                  </p>
                </div>
                <Switch
                  checked={preferences.email_reminders_trial}
                  onCheckedChange={(checked: boolean) =>
                    updatePreferences({ email_reminders_trial: checked })
                  }
                  disabled={prefsSaving}
                />
              </div>

              {/* In-app reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>In-app reminders</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    Show reminder notifications in the sidebar bell
                  </p>
                </div>
                <Switch
                  checked={preferences.in_app_reminders}
                  onCheckedChange={(checked: boolean) =>
                    updatePreferences({ in_app_reminders: checked })
                  }
                  disabled={prefsSaving}
                />
              </div>

              {/* Reminder advance days */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Reminder advance notice</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    How many days before renewal to be reminded
                  </p>
                </div>
                <select
                  value={preferences.reminder_days_before}
                  onChange={(e) =>
                    updatePreferences({ reminder_days_before: parseInt(e.target.value) as 2 | 3 | 5 | 7 })
                  }
                  disabled={prefsSaving}
                  className={`rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors appearance-none ${
                    isDark
                      ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white focus:border-[#555555]'
                      : 'bg-white border border-gray-300 text-black focus:border-gray-500'
                  }`}
                >
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>1 week</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Display Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Display Preferences</h3>

          {prefsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <FiLoader className={`w-4 h-4 animate-spin ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              <span className={`text-sm ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Currency selector */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Currency</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    Display all amounts in this currency
                  </p>
                </div>
                <select
                  value={preferences.currency || 'USD'}
                  onChange={(e) =>
                    updatePreferences({ currency: e.target.value as Currency })
                  }
                  disabled={prefsSaving}
                  className={`rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors appearance-none min-w-[140px] ${
                    isDark
                      ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white focus:border-[#555555]'
                      : 'bg-white border border-gray-300 text-black focus:border-gray-500'
                  }`}
                >
                  {(Object.keys(CURRENCIES) as Currency[]).map((code) => (
                    <option key={code} value={code}>
                      {CURRENCIES[code].symbol} {code} - {CURRENCIES[code].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Budget Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Budget Settings</h3>

          {prefsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <FiLoader className={`w-4 h-4 animate-spin ${isDark ? 'text-[#555555]' : 'text-gray-600'}`} />
              <span className={`text-sm ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Enable budget tracking */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Enable budget tracking</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    Track your spending against a monthly limit
                  </p>
                </div>
                <Switch
                  checked={preferences.budget_enabled || false}
                  onCheckedChange={(checked: boolean) =>
                    updatePreferences({ budget_enabled: checked })
                  }
                  disabled={prefsSaving}
                />
              </div>

              {/* Monthly budget limit - only show when enabled */}
              {preferences.budget_enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Monthly budget limit</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                        Maximum monthly subscription spending
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                        {CURRENCIES[preferences.currency || 'USD'].symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={budgetInputValue}
                        onChange={(e) => setBudgetInputValue(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : null
                          if (value !== preferences.monthly_budget) {
                            updatePreferences({ monthly_budget: value })
                          }
                        }}
                        disabled={prefsSaving}
                        placeholder="100"
                        className={`w-24 rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white placeholder:text-[#444444] focus:border-[#555555]'
                            : 'bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Alert threshold */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>Alert threshold</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                        Warn when spending reaches this percentage
                      </p>
                    </div>
                    <select
                      value={preferences.budget_alert_threshold || 80}
                      onChange={(e) =>
                        updatePreferences({ budget_alert_threshold: parseInt(e.target.value) })
                      }
                      disabled={prefsSaving}
                      className={`rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors appearance-none ${
                        isDark
                          ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white focus:border-[#555555]'
                          : 'bg-white border border-gray-300 text-black focus:border-gray-500'
                      }`}
                    >
                      <option value={50}>50%</option>
                      <option value={75}>75%</option>
                      <option value={80}>80%</option>
                      <option value={90}>90%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                isDark ? 'text-[#999999]' : 'text-gray-600'
              }`}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white placeholder:text-[#444444] focus:border-[#555555]'
                    : 'bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                isDark ? 'text-[#999999]' : 'text-gray-600'
              }`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white placeholder:text-[#444444] focus:border-[#555555]'
                    : 'bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:border-gray-500'
                }`}
              />
            </div>

            {passwordMessage && (
              <p className={`text-xs ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>{passwordMessage}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {passwordLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </motion.div>

        {/* Import / Export Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Import / Export Data</h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            Import subscriptions from CSV or export your data
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className={`flex items-center gap-2 text-sm rounded-lg px-5 py-2.5 transition-all duration-200 ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FiUpload className="w-4 h-4" />
              Import from CSV
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 text-sm rounded-lg px-5 py-2.5 transition-all duration-200 ${
                isDark
                  ? 'border border-[#1A1A1A] text-white hover:border-[#333333] hover:bg-[#111111]'
                  : 'border border-gray-300 text-black hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              <FiDownload className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#0A0A0A] border border-[#1A1A1A]' 
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <h3 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Delete Account</h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
            Permanently delete your account and all data. This action cannot be undone.
          </p>

          {showDeleteConfirm ? (
            <div className={`rounded-lg p-4 ${
              isDark 
                ? 'bg-[#0D0D0D] border border-[#1F1F1F]' 
                : 'bg-white border border-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FiAlertTriangle className="w-4 h-4 text-[#999999]" />
                <p className="text-white text-sm font-medium">
                  Are you sure?
                </p>
              </div>
              <p className="text-[#555555] text-xs mb-4">
                This will permanently delete all your subscriptions and account data.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, delete my account'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[#555555] text-sm px-5 py-2 border border-[#1A1A1A] rounded-lg hover:border-[#333333] hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[#555555] text-sm px-5 py-2.5 border border-[#1A1A1A] rounded-lg hover:border-[#333333] hover:text-white transition-all duration-200"
            >
              Delete Account
            </button>
          )}
        </motion.div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => {
          // Refresh subscriptions data
          window.location.reload()
        }}
      />
    </>
  )
}
