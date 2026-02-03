'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reminder } from '@/lib/types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchReminders = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const weekFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
      .from('reminders')
      .select('*, subscription:subscriptions(*)')
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .lte('reminder_date', weekFromNow)
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
  }, [])

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
