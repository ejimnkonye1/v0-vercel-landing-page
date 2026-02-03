'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserPreferences } from '@/lib/types'

const DEFAULT_PREFERENCES = {
  email_reminders_renewal: true,
  email_reminders_trial: true,
  in_app_reminders: true,
  reminder_days_before: 2 as const,
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabaseRef = useRef(createClient())

  const fetchPreferences = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setPreferences(data as UserPreferences)
    }
    setLoading(false)
  }, [])

  const updatePreferences = useCallback(async (
    updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    setSaving(true)
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const current = preferences
      ? {
          email_reminders_renewal: preferences.email_reminders_renewal,
          email_reminders_trial: preferences.email_reminders_trial,
          in_app_reminders: preferences.in_app_reminders,
          reminder_days_before: preferences.reminder_days_before,
        }
      : DEFAULT_PREFERENCES

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          ...current,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (!error && data) {
      setPreferences(data as UserPreferences)
    }
    setSaving(false)
  }, [preferences])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const effectivePreferences = preferences ?? {
    ...DEFAULT_PREFERENCES,
    id: '',
    user_id: '',
    created_at: '',
    updated_at: '',
  } as UserPreferences

  return {
    preferences: effectivePreferences,
    loading,
    saving,
    updatePreferences,
    refetch: fetchPreferences,
  }
}
