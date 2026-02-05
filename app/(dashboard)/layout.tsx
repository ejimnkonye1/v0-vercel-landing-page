'use client'

import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { useTheme } from '@/lib/theme-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isDark } = useTheme()

  return (
    <AuthProvider>
      <div className={isDark ? 'min-h-screen bg-black' : 'min-h-screen bg-white'}>
        {/* Mobile top bar */}
        <div className={`fixed top-0 left-0 right-0 h-14 flex items-center px-4 z-30 lg:hidden ${
          isDark
            ? 'bg-[#0A0A0A] border-b border-[#1A1A1A]'
            : 'bg-gray-50 border-b border-gray-200'
        }`}>
          <button
            type="button"
            title="Open menu"
            onClick={() => setSidebarOpen(true)}
            className={`p-2 -ml-2 rounded-lg transition-all ${
              isDark
                ? 'text-[#666666] hover:text-white hover:bg-[#111111]'
                : 'text-gray-600 hover:text-black hover:bg-gray-200'
            }`}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xs tracking-tight">SW</span>
            </div>
            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>SubWise</span>
          </div>
        </div>

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className={`min-h-screen pt-14 lg:pt-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
        }`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
