'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiLoader, FiDownload, FiAlertTriangle } from 'react-icons/fi'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { updatePassword } from '@/lib/supabase/auth'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { usePreferences } from '@/hooks/usePreferences'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user } = useAuthContext()
  const { subscriptions } = useSubscriptions()
  const { preferences, loading: prefsLoading, saving: prefsSaving, updatePreferences } = usePreferences()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#555555] text-sm mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Profile</h3>
          <div>
            <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
              Email
            </label>
            <div className="bg-[#0D0D0D] border border-[#1F1F1F] text-[#666666] rounded-lg px-4 py-3 text-sm">
              {user?.email || 'Loading...'}
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Notification Preferences</h3>

          {prefsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <FiLoader className="w-4 h-4 animate-spin text-[#555555]" />
              <span className="text-[#555555] text-sm">Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Email reminders for renewals */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Email reminders for renewals</p>
                  <p className="text-[#555555] text-xs mt-0.5">
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
                  <p className="text-white text-sm">Email reminders for trials ending</p>
                  <p className="text-[#555555] text-xs mt-0.5">
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
                  <p className="text-white text-sm">In-app reminders</p>
                  <p className="text-[#555555] text-xs mt-0.5">
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
                  <p className="text-white text-sm">Reminder advance notice</p>
                  <p className="text-[#555555] text-xs mt-0.5">
                    How many days before renewal to be reminded
                  </p>
                </div>
                <select
                  value={preferences.reminder_days_before}
                  onChange={(e) =>
                    updatePreferences({ reminder_days_before: parseInt(e.target.value) as 2 | 3 | 5 | 7 })
                  }
                  disabled={prefsSaving}
                  className="bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-3 py-2 text-sm focus:border-[#555555] focus:outline-none transition-colors appearance-none"
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

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#999999] text-xs font-medium mb-2 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#444444] focus:border-[#555555] focus:outline-none transition-colors"
              />
            </div>

            {passwordMessage && (
              <p className="text-[#999999] text-xs">{passwordMessage}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
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

        {/* Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-2">Export Data</h3>
          <p className="text-[#555555] text-xs mb-4">
            Download all your subscription data as JSON
          </p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-[#1A1A1A] text-white text-sm rounded-lg px-5 py-2.5 hover:border-[#333333] hover:bg-[#111111] transition-all duration-200"
          >
            <FiDownload className="w-4 h-4" />
            Export Subscriptions
          </button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold text-sm mb-2">Delete Account</h3>
          <p className="text-[#555555] text-xs mb-4">
            Permanently delete your account and all data. This action cannot be undone.
          </p>

          {showDeleteConfirm ? (
            <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg p-4">
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
    </>
  )
}
