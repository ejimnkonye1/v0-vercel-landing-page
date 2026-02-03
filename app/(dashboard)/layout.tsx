'use client'

import { useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center px-4 z-30 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#666666] hover:text-white p-2 -ml-2 rounded-lg hover:bg-[#111111] transition-all"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-white text-sm">SubTracker</span>
          </div>
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
