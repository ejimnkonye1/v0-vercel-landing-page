'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiCalendar, FiClock, FiX } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { markReminderSent } from '@/lib/supabase/queries'
import type { Reminder } from '@/lib/types'

interface ReminderDropdownProps {
  reminders: Reminder[]
  onClose: () => void
  onDismiss: () => void
}

const reminderIcons = {
  trial_ending: FiAlertCircle,
  renewal: FiCalendar,
  unused: FiClock,
}

const reminderMessages = {
  trial_ending: 'Trial ending soon',
  renewal: 'Renewal coming up',
  unused: 'Subscription unused',
}

export function ReminderDropdown({ reminders, onClose, onDismiss }: ReminderDropdownProps) {
  const { isDark } = useTheme()
  const handleDismiss = async (id: string) => {
    await markReminderSent(id)
    onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
      className={`absolute bottom-full left-0 mb-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50 border ${
        isDark
          ? 'bg-[#0A0A0A] border-[#1A1A1A]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className={`px-4 py-3 border-b ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
        <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>Reminders</h3>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {reminders.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className={`text-sm ${isDark ? 'text-[#444444]' : 'text-gray-500'}`}>No reminders</p>
          </div>
        ) : (
          reminders.map((reminder) => {
            const Icon = reminderIcons[reminder.reminder_type] || FiCalendar
            const message = reminderMessages[reminder.reminder_type] || 'Reminder'
            const subName = reminder.subscription?.name || 'Subscription'
            const date = new Date(reminder.reminder_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div
                key={reminder.id}
                className={`flex items-start gap-3 px-4 py-3 border-b transition-colors last:border-b-0 ${
                  isDark
                    ? 'hover:bg-[#111111] border-[#1A1A1A]'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark ? 'bg-[#111111]' : 'bg-gray-200'
                }`}>
                  <Icon className={`w-4 h-4 ${isDark ? 'text-[#666666]' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{message}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#555555]' : 'text-gray-600'}`}>
                    {subName} &middot; {date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {reminder.subscription && (
                    <Link
                      href={`/subscription/${reminder.subscription_id}`}
                      onClick={onClose}
                      className={`text-xs transition-colors ${
                        isDark
                          ? 'text-[#555555] hover:text-white'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className={`transition-colors p-0.5 ${
                      isDark
                        ? 'text-[#444444] hover:text-white'
                        : 'text-gray-500 hover:text-black'
                    }`}
                    title="Dismiss"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
