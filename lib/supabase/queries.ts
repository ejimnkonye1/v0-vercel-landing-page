import { createClient } from './client'
import type { Subscription, SubscriptionFormData, Reminder, UserPreferences, BillingCycle } from '@/lib/types'

// Helper to report prices to crowdsourced database
async function reportPriceToCrowdsource(
  subscriptionId: string,
  serviceName: string,
  newPrice: number,
  billingCycle: BillingCycle,
  oldPrice?: number
) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    await fetch('/api/price-changes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        subscriptionId,
        serviceName,
        oldPrice,
        newPrice,
        billingCycle,
      }),
    })
  } catch {
    // Silently fail - this is non-critical
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ─── Subscriptions ───────────────────────────────────────────────

export async function getSubscriptions() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Subscription[] | null, error }
}

export async function getSubscription(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  return { data: data as Subscription | null, error }
}

export async function createSubscription(formData: SubscriptionFormData) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      ...formData,
      user_id: userId,
      logo_identifier: formData.logo_identifier || formData.name.toLowerCase().trim(),
    })
    .select()
    .single()

  if (!error && data) {
    // Report price to crowdsourced database (fire and forget)
    reportPriceToCrowdsource(data.id, formData.name, formData.cost, formData.billing_cycle).catch(() => {})

    // Get user's preferred reminder advance days
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('reminder_days_before')
      .eq('user_id', userId)
      .single()
    const daysBefore = prefs?.reminder_days_before ?? 2

    // Auto-create reminder before renewal
    const renewalDate = new Date(formData.renewal_date)
    const reminderDate = new Date(renewalDate)
    reminderDate.setDate(reminderDate.getDate() - daysBefore)

    // Always create reminder - if it's in the past, it will trigger immediately
    // This ensures users get notified even for imminent renewals
    await supabase.from('reminders').insert({
      user_id: userId,
      subscription_id: data.id,
      reminder_type: 'renewal',
      reminder_date: reminderDate.toISOString(),
      is_sent: false,
    })

    // Auto-create trial reminder if trial subscription
    if (formData.status === 'trial' && formData.trial_end_date) {
      const trialEnd = new Date(formData.trial_end_date)
      const trialReminder = new Date(trialEnd)
      trialReminder.setDate(trialReminder.getDate() - daysBefore)

      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: data.id,
        reminder_type: 'trial_ending',
        reminder_date: trialReminder.toISOString(),
        is_sent: false,
      })
    }
  }

  return { data: data as Subscription | null, error }
}

export async function bulkCreateSubscriptions(
  subscriptions: SubscriptionFormData[]
): Promise<{ created: number; errors: string[] }> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { created: 0, errors: ['Not authenticated'] }

  // Get user's preferred reminder advance days
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('reminder_days_before')
    .eq('user_id', userId)
    .single()
  const daysBefore = prefs?.reminder_days_before ?? 2

  let created = 0
  const errors: string[] = []

  for (const formData of subscriptions) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...formData,
        user_id: userId,
        logo_identifier: formData.logo_identifier || formData.name.toLowerCase().trim(),
      })
      .select()
      .single()

    if (error) {
      errors.push(`Failed to create ${formData.name}: ${error.message}`)
      continue
    }

    if (data) {
      created++

      // Auto-create reminder before renewal (always, even if in the past)
      const renewalDate = new Date(formData.renewal_date)
      const reminderDate = new Date(renewalDate)
      reminderDate.setDate(reminderDate.getDate() - daysBefore)

      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: data.id,
        reminder_type: 'renewal',
        reminder_date: reminderDate.toISOString(),
        is_sent: false,
      })
    }
  }

  return { created, errors }
}

export async function updateSubscription(id: string, formData: Partial<SubscriptionFormData>) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  // Fetch current subscription to track price changes
  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('name, cost, billing_cycle')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (!error && data) {
    // Report price change if cost changed
    if (formData.cost !== undefined && currentSub && formData.cost !== currentSub.cost) {
      reportPriceToCrowdsource(
        id,
        formData.name || currentSub.name,
        formData.cost,
        (formData.billing_cycle || currentSub.billing_cycle) as BillingCycle,
        currentSub.cost
      ).catch(() => {})
    }
  }

  if (!error && data && formData.renewal_date) {
    // Delete old unsent renewal reminders for this subscription
    await supabase
      .from('reminders')
      .delete()
      .eq('subscription_id', id)
      .eq('reminder_type', 'renewal')
      .eq('is_sent', false)

    // Get user's preferred reminder advance days
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('reminder_days_before')
      .eq('user_id', userId)
      .single()
    const daysBefore = prefs?.reminder_days_before ?? 2

    // Create new renewal reminder (always, even if in the past)
    const renewalDate = new Date(formData.renewal_date)
    const reminderDate = new Date(renewalDate)
    reminderDate.setDate(reminderDate.getDate() - daysBefore)

    await supabase.from('reminders').insert({
      user_id: userId,
      subscription_id: id,
      reminder_type: 'renewal',
      reminder_date: reminderDate.toISOString(),
      is_sent: false,
    })
  }

  return { data: data as Subscription | null, error }
}

export async function deleteSubscription(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  // Delete related reminders first
  await supabase
    .from('reminders')
    .delete()
    .eq('subscription_id', id)
    .eq('user_id', userId)

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

export async function markSubscriptionUsed(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  const { error } = await supabase
    .from('subscriptions')
    .update({ last_used: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

// ─── Reminders ───────────────────────────────────────────────────

export async function getReminders() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('user_id', userId)
    .order('reminder_date', { ascending: true })

  return { data: data as Reminder[] | null, error }
}

export async function getUpcomingReminders() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const now = new Date().toISOString()
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('user_id', userId)
    .eq('is_sent', false)
    .gte('reminder_date', now)
    .lte('reminder_date', weekFromNow)
    .order('reminder_date', { ascending: true })

  return { data: data as Reminder[] | null, error }
}

export async function createReminder(reminder: {
  subscription_id: string
  reminder_type: string
  reminder_date: string
}) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      ...reminder,
      user_id: userId,
      is_sent: false,
    })
    .select()
    .single()

  return { data, error }
}

export async function markReminderSent(id: string) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { error: { message: 'Not authenticated' } }

  const { error } = await supabase
    .from('reminders')
    .update({ is_sent: true })
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

// ─── Analytics helpers ───────────────────────────────────────────

export async function getSpendingByCategory() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('category, cost, billing_cycle')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])

  if (error || !data) return { data: null, error }

  const categoryMap: Record<string, number> = {}
  data.forEach((sub) => {
    const monthlyCost = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost
    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyCost
  })

  const result = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }))

  return { data: result, error: null }
}

// ─── User Preferences ────────────────────────────────────────────

export async function getUserPreferences() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Row not found is not an error - user just hasn't customized yet
  if (error?.code === 'PGRST116') {
    return { data: null, error: null }
  }

  return { data: data as UserPreferences | null, error }
}

export async function upsertUserPreferences(
  prefs: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        ...prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  return { data: data as UserPreferences | null, error }
}

// ─── Reminder Backfill ──────────────────────────────────────────

export async function backfillMissingReminders() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { created: 0, error: { message: 'Not authenticated' } }

  // Get user's preferred reminder advance days
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('reminder_days_before')
    .eq('user_id', userId)
    .single()
  const daysBefore = prefs?.reminder_days_before ?? 2

  // Get all active/trial subscriptions
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])

  if (subsError || !subs) {
    return { created: 0, error: subsError }
  }

  let createdCount = 0

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
      createdCount++
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
        createdCount++
      }
    }
  }

  return { created: createdCount, error: null }
}

// ─── Renewal Advancement ─────────────────────────────────────────

export async function advanceOverdueSubscriptions() {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { advanced: 0, error: { message: 'Not authenticated' } }

  const now = new Date()

  const { data: overdue, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])
    .lt('renewal_date', now.toISOString())

  if (fetchError || !overdue || overdue.length === 0) {
    return { advanced: 0, error: fetchError }
  }

  // Get user's preferred reminder advance days
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('reminder_days_before')
    .eq('user_id', userId)
    .single()
  const daysBefore = prefs?.reminder_days_before ?? 2

  let advancedCount = 0
  for (const sub of overdue) {
    let newDate = new Date(sub.renewal_date)
    while (newDate < now) {
      if (sub.billing_cycle === 'yearly') {
        newDate.setFullYear(newDate.getFullYear() + 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
    }

    await supabase
      .from('subscriptions')
      .update({ renewal_date: newDate.toISOString(), updated_at: now.toISOString() })
      .eq('id', sub.id)
      .eq('user_id', userId)

    // Delete old unsent reminders
    await supabase
      .from('reminders')
      .delete()
      .eq('subscription_id', sub.id)
      .eq('is_sent', false)

    // Create new reminder
    const reminderDate = new Date(newDate)
    reminderDate.setDate(reminderDate.getDate() - daysBefore)
    if (reminderDate > now) {
      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: sub.id,
        reminder_type: 'renewal',
        reminder_date: reminderDate.toISOString(),
        is_sent: false,
      })
    }

    advancedCount++
  }

  return { advanced: advancedCount, error: null }
}
