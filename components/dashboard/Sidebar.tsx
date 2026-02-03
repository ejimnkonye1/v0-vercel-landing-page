'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiX,
} from 'react-icons/fi'
import { signOut } from '@/lib/supabase/auth'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useTheme } from '@/lib/theme-context'
import { ReminderBell } from '@/components/reminders/ReminderBell'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/settings', label: 'Settings', icon: FiSettings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthContext()
  const { isDark } = useTheme()

  const handleSignOut = async () => {
    onClose()
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-40 ${
      isDark
        ? 'bg-[#0A0A0A] border-r border-[#1A1A1A]'
        : 'bg-gray-50 border-r border-gray-200'
    }`}>
      {/* Logo */}
      <div className={`p-6 flex items-center justify-between ${
        isDark ? 'border-b border-[#1A1A1A]' : 'border-b border-gray-200'
      }`}>
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-black'}`}>SubTracker</span>
        </Link>
        <button
          onClick={onClose}
          className={`lg:hidden p-1 rounded-lg transition-all ${
            isDark
              ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
              : 'text-gray-600 hover:text-black hover:bg-gray-200'
          }`}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? isActive
                      ? 'text-white bg-[#111111]'
                      : 'text-[#666666] hover:text-white hover:bg-[#111111]/50'
                    : isActive
                      ? 'text-black bg-gray-200'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={`p-3 ${isDark ? 'border-t border-[#1A1A1A]' : 'border-t border-gray-200'}`}>
        {/* Reminder bell */}
        <div className="px-3 py-2 mb-2">
          <ReminderBell />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'
          }`}>
            <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.email || 'User'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white hover:bg-[#111111]/50'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
        >
          <FiLogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile: slide-out drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
