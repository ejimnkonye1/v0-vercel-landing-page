'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reminder } from '@/lib/types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const hasBackfilledRef = useRef(false)

  const backfillReminders = useCallback(async (userId: string) => {
    if (hasBackfilledRef.current) return
    hasBackfilledRef.current = true

    const supabase = supabaseRef.current

    // Get user's preferred reminder advance days
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('reminder_days_before')
      .eq('user_id', userId)
      .single()
    const daysBefore = prefs?.reminder_days_before ?? 2

    // Get all active/trial subscriptions
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])

    if (!subs || subs.length === 0) return

    for (const sub of subs) {
      // Check if there's already an unsent reminder for this subscription
      const { data: existingReminder } = await supabase
        .from('reminders')
        .select('id')
        .eq('subscription_id', sub.id)
        .eq('reminder_type', 'renewal')
        .eq('is_sent', false)
        .single()

      if (!existingReminder) {
        // Create reminder for this subscription
        const renewalDate = new Date(sub.renewal_date)
        const reminderDate = new Date(renewalDate)
        reminderDate.setDate(reminderDate.getDate() - daysBefore)

        await supabase.from('reminders').insert({
          user_id: userId,
          subscription_id: sub.id,
          reminder_type: 'renewal',
          reminder_date: reminderDate.toISOString(),
          is_sent: false,
        })
      }

      // Check for trial reminder if needed
      if (sub.status === 'trial' && sub.trial_end_date) {
        const { data: existingTrialReminder } = await supabase
          .from('reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('reminder_type', 'trial_ending')
          .eq('is_sent', false)
          .single()

        if (!existingTrialReminder) {
          const trialEnd = new Date(sub.trial_end_date)
          const trialReminder = new Date(trialEnd)
          trialReminder.setDate(trialReminder.getDate() - daysBefore)

          await supabase.from('reminders').insert({
            user_id: userId,
            subscription_id: sub.id,
            reminder_type: 'trial_ending',
            reminder_date: trialReminder.toISOString(),
            is_sent: false,
          })
        }
      }
    }
  }, [])

  const fetchReminders = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Backfill any missing reminders first
    await backfillReminders(user.id)

    // Fetch all unsent reminders (past and upcoming within 7 days)
    // Past reminders should be shown immediately as they need attention
    const weekFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
      .from('reminders')
      .select('*, subscription:subscriptions(*)')
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .lte('reminder_date', weekFromNow) // Include all unsent reminders up to 7 days from now
      .order('reminder_date', { ascending: true })

    if (!error && data) {
      // Check if in-app reminders are enabled
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('in_app_reminders')
        .eq('user_id', user.id)
        .single()

      const inAppEnabled = prefs?.in_app_reminders ?? true
      setReminders(inAppEnabled ? (data as Reminder[]) : [])
    }
    setLoading(false)
  }, [backfillReminders])

  useEffect(() => {
    fetchReminders()

    // Real-time listener filtered by user_id
    const supabase = supabaseRef.current
    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      return supabase
        .channel(`reminders-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reminders',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchReminders()
          }
        )
        .subscribe()
    }

    let channel: ReturnType<typeof supabase.channel> | null = null
    setupChannel().then((ch) => { channel = ch })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchReminders])

  const unreadCount = reminders.length

  return {
    reminders,
    loading,
    unreadCount,
    refetch: fetchReminders,
  }
}
