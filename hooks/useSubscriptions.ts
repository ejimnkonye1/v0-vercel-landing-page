'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { advanceOverdueSubscriptions } from '@/lib/supabase/queries'
import type { Subscription } from '@/lib/types'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const userIdRef = useRef<string | null>(null)
  const advancingRef = useRef(false)

  const fetchSubscriptions = useCallback(async () => {
    // Skip re-fetch if we're currently advancing renewal dates
    if (advancingRef.current) return

    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    userIdRef.current = user.id

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const subs = data as Subscription[]

      // Check for overdue subscriptions and auto-advance
      const hasOverdue = subs.some(
        (s) =>
          (s.status === 'active' || s.status === 'trial') &&
          new Date(s.renewal_date) < new Date()
      )

      if (hasOverdue && !advancingRef.current) {
        advancingRef.current = true
        await advanceOverdueSubscriptions()
        advancingRef.current = false
        // Re-fetch with updated data
        const { data: freshData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (freshData) {
          setSubscriptions(freshData as Subscription[])
        }
      } else {
        setSubscriptions(subs)
      }
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubscriptions()

    // Real-time listener filtered by user_id
    const supabase = supabaseRef.current
    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      return supabase
        .channel(`subscriptions-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchSubscriptions()
          }
        )
        .subscribe()
    }

    let channel: ReturnType<typeof supabase.channel> | null = null
    setupChannel().then((ch) => { channel = ch })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchSubscriptions])

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'trial'
  )

  const totalMonthlySpend = activeSubscriptions.reduce((sum, s) => {
    const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
    return sum + monthly
  }, 0)

  const totalYearlyProjection = totalMonthlySpend * 12

  const activeCount = activeSubscriptions.length

  const cancelledSavings = subscriptions
    .filter((s) => s.status === 'cancelled')
    .reduce((sum, s) => {
      const monthly = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + monthly
    }, 0)

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
    totalMonthlySpend,
    totalYearlyProjection,
    activeCount,
    cancelledSavings,
  }
}
