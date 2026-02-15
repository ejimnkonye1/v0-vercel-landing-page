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
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { signOut } from '@/lib/supabase/auth'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useTheme } from '@/lib/theme-context'
import { useToast } from '@/contexts/ToastContext'
import { ReminderBell } from '@/components/reminders/ReminderBell'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/settings', label: 'Settings', icon: FiSettings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthContext()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const handleSignOut = async () => {
    onClose()
    toast('Signed out', 'success')
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <aside className={`fixed left-0 top-0 h-dvh flex flex-col z-40 transition-all duration-300 ${
      collapsed ? 'w-[68px]' : 'w-64'
    } ${
      isDark
        ? 'bg-[#0A0A0A] border-r border-[#1A1A1A]'
        : 'bg-gray-50 border-r border-gray-200'
    }`}>
      {/* Logo + collapse toggle */}
      <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} ${
        isDark ? 'border-b border-[#1A1A1A]' : 'border-b border-gray-200'
      }`}>
        <Link href="/dashboard" onClick={onClose} className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm tracking-tight" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>SW</span>
          </div>
          {!collapsed && (
            <span className={`font-semibold text-base tracking-tight ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>SubWise</span>
          )}
        </Link>

        {/* Desktop collapse toggle - next to logo */}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className={`hidden lg:flex p-1.5 rounded-lg transition-all ${
              isDark
                ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
                : 'text-gray-400 hover:text-black hover:bg-gray-200'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {/* Mobile close */}
        <button
          type="button"
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

      {/* Expand button when collapsed - sits at top */}
      {collapsed && (
        <div className="hidden lg:flex justify-center py-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? 'text-[#555555] hover:text-white hover:bg-[#111111]'
                : 'text-gray-400 hover:text-black hover:bg-gray-200'
            }`}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? isActive
                      ? 'text-white bg-[#111111]'
                      : 'text-[#666666] hover:text-white hover:bg-[#111111]/50'
                    : isActive
                      ? 'text-black bg-gray-200'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={`p-2 ${isDark ? 'border-t border-[#1A1A1A]' : 'border-t border-gray-200'}`}>
        {/* Reminder bell */}
        <div className={`${collapsed ? 'flex justify-center' : 'px-3'} py-2 mb-2`}>
          <ReminderBell collapsed={collapsed} />
        </div>

        {/* User info */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 mb-2`} title={collapsed ? (user?.email || 'User') : undefined}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'
          }`}>
            <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                {user?.email || 'User'}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleSignOut}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            isDark
              ? 'text-[#666666] hover:text-white hover:bg-[#111111]/50'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
          }`}
          title={collapsed ? 'Log out' : undefined}
        >
          <FiLogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Log out'}
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
