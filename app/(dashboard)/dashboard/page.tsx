'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals'
import { SubscriptionGrid } from '@/components/dashboard/SubscriptionGrid'
import { AddSubscriptionModal } from '@/components/dashboard/AddSubscriptionModal'
import { deleteSubscription } from '@/lib/supabase/queries'
import type { Subscription } from '@/lib/types'

export default function DashboardPage() {
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

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
        <div className="w-6 h-6 border-2 border-[#222222] border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#555555] text-sm mt-1">
          Manage and track all your subscriptions
        </p>
      </motion.div>

      {/* Error banner */}
      {(error || deleteError) && (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 mb-6">
          <p className="text-[#999999] text-sm">{error || deleteError}</p>
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

      {/* Charts and Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <SpendingChart subscriptions={subscriptions} />
        </div>
        <UpcomingRenewals subscriptions={subscriptions} />
      </div>

      {/* Subscriptions Grid */}
      <SubscriptionGrid
        subscriptions={subscriptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* FAB - Add button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3, delay: 0.5 }}
        onClick={() => {
          setEditingSub(null)
          setModalOpen(true)
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 z-30"
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSaved={refetch}
        editSubscription={editingSub}
      />
    </>
  )
}
