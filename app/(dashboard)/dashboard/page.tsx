'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { usePreferences } from '@/hooks/usePreferences'
import { usePriceTrends } from '@/hooks/usePriceTrends'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { SubscriptionGrowthChart } from '@/components/dashboard/SubscriptionGrowthChart'
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals'
import { SubscriptionGrid } from '@/components/dashboard/SubscriptionGrid'
import { AddSubscriptionModal } from '@/components/dashboard/AddSubscriptionModal'
import { BudgetProgressBar } from '@/components/dashboard/BudgetProgressBar'
import { BudgetAlert } from '@/components/ui/BudgetAlert'
import { PortfolioHealth } from '@/components/dashboard/PortfolioHealth'
import { Graveyard } from '@/components/dashboard/Graveyard'
import { ShareSavings } from '@/components/dashboard/ShareSavings'
import { AIAdvisor } from '@/components/dashboard/AIAdvisor'
import { PriceAlerts } from '@/components/dashboard/PriceAlerts'
import { ExtensionStatus } from '@/components/dashboard/ExtensionStatus'
import { EmailReceiptScanner } from '@/components/dashboard/EmailReceiptScanner'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { deleteSubscription } from '@/lib/supabase/queries'
import type { Subscription } from '@/lib/types'

export default function DashboardPage() {
  const { isDark } = useTheme()
  const {
    subscriptions,
    loading,
    error,
    refetch,
    totalMonthlySpend,
    totalYearlyProjection,
    activeCount,
    cancelledSavings,
  } = useSubscriptions()
  const { preferences } = usePreferences()
  const { trends: priceTrends } = usePriceTrends()

  const showBudget = preferences.budget_enabled && preferences.monthly_budget && preferences.monthly_budget > 0



  const [isModalOpening, setIsModalOpening] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleOpenModal = () => {
    setIsModalOpening(true)
    setEditingSub(null)
    setModalOpen(true)
    setTimeout(() => setIsModalOpening(false), 600)
  }

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    setDeleteError(null)
    const { error } = await deleteSubscription(id)
    if (error) {
      setDeleteError(typeof error === 'object' && 'message' in error ? error.message : 'Failed to delete')
    } else {
      refetch()
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingSub(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? 'border-[#222222] border-t-white' : 'border-gray-300 border-t-black'}`} />
      </div>
    )
  }

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#555555]' : 'text-[#999999]'}`}>
            Manage and track all your subscriptions
          </p>
        </div>
        <ShareSavings
          totalSavings={cancelledSavings}
          subscriptionCount={activeCount}
          cancelledCount={subscriptions.filter(s => s.status === 'cancelled').length}
        />
      </motion.div>

      {/* Error banner */}
      {(error || deleteError) && (
        <div className={`rounded-lg p-3 mb-6 ${isDark ? 'bg-[#1A1A1A] border border-[#333333]' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${isDark ? 'text-[#999999]' : 'text-red-600'}`}>{error || deleteError}</p>
        </div>
      )}

      {/* Budget Alert */}
      {showBudget && (
        <BudgetAlert
          monthlySpend={totalMonthlySpend}
          budgetLimit={preferences.monthly_budget!}
          threshold={preferences.budget_alert_threshold || 80}
        />
      )}

      {/* Budget Progress Bar */}
      {showBudget && (
        <div className="mb-6">
          <BudgetProgressBar
            monthlySpend={totalMonthlySpend}
            budgetLimit={preferences.monthly_budget!}
            threshold={preferences.budget_alert_threshold || 80}
          />
        </div>
      )}

      {/* Stats */}
      <div className="mb-6">
        <StatsCards
          totalMonthlySpend={totalMonthlySpend}
          totalYearlyProjection={totalYearlyProjection}
          activeCount={activeCount}
          savingsThisMonth={cancelledSavings}
        />
      </div>

      {/* Charts, Renewals, and Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <SpendingChart subscriptions={subscriptions} />
          <SubscriptionGrowthChart subscriptions={subscriptions} />
          <CategoryBreakdown subscriptions={subscriptions} />
        </div>
        <div className="space-y-4">
          <UpcomingRenewals subscriptions={subscriptions} />
          <PortfolioHealth subscriptions={subscriptions} />
          <AIAdvisor
            subscriptions={subscriptions}
            totalMonthlySpend={totalMonthlySpend}
            totalYearlyProjection={totalYearlyProjection}
          />
          <PriceAlerts />
          <ExtensionStatus />
          <EmailReceiptScanner />
          <Graveyard subscriptions={subscriptions} onRevive={refetch} />
        </div>
      </div>

      {/* Subscriptions Grid */}
      <SubscriptionGrid
        subscriptions={subscriptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        priceTrends={priceTrends}
      />

      {/* FAB - Add button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3, delay: 0.5 }}
        onClick={handleOpenModal}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-30 ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}
      >
        <motion.div
          animate={{ rotate: isHovering || isModalOpening ? 360 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <FiPlus className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSaved={refetch}
        editSubscription={editingSub}
        existingSubscriptions={subscriptions}
      />
    </>
  )
}
