'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useReminders } from '@/hooks/useReminders'
import { ReminderDropdown } from './ReminderDropdown'

interface ReminderBellProps {
  collapsed?: boolean
}

export function ReminderBell({ collapsed = false }: ReminderBellProps) {
  const { isDark } = useTheme()
  const { reminders, unreadCount, refetch } = useReminders()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={collapsed ? 'Reminders' : undefined}
        className={`relative flex items-center ${collapsed ? 'justify-center' : ''} gap-2 transition-colors duration-200 ${
          isDark ? 'text-[#666666] hover:text-white' : 'text-gray-600 hover:text-black'
        }`}
      >
        <FiBell className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span className="text-sm">Reminders</span>}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 ${collapsed ? 'left-2.5' : 'left-2.5'} w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <ReminderDropdown
            reminders={reminders}
            onClose={() => setIsOpen(false)}
            onDismiss={refetch}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
