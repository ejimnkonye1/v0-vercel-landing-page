import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function advanceDate(dateStr: string, billingCycle: string): string {
  const date = new Date(dateStr)
  if (billingCycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
  return date.toISOString()
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Find all active/trial subscriptions where renewal_date has passed
    const { data: overdueSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trial'])
      .lt('renewal_date', now.toISOString())

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!overdueSubscriptions || overdueSubscriptions.length === 0) {
      return NextResponse.json({ message: 'No overdue subscriptions', advanced: 0 })
    }

    let advancedCount = 0
    const errors: string[] = []

    for (const sub of overdueSubscriptions) {
      // Advance until the renewal date is in the future
      let newDate = sub.renewal_date
      while (new Date(newDate) < now) {
        newDate = advanceDate(newDate, sub.billing_cycle)
      }

      // Update the subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          renewal_date: newDate,
          updated_at: now.toISOString(),
        })
        .eq('id', sub.id)

      if (updateError) {
        errors.push(`Failed to advance ${sub.id}: ${updateError.message}`)
        continue
      }

      // Delete old unsent reminders for this subscription
      await supabase
        .from('reminders')
        .delete()
        .eq('subscription_id', sub.id)
        .eq('is_sent', false)

      // Get user's preferred reminder advance days
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('reminder_days_before')
        .eq('user_id', sub.user_id)
        .single()
      const daysBefore = prefs?.reminder_days_before ?? 2

      // Create new reminder before the new renewal_date
      const reminderDate = new Date(newDate)
      reminderDate.setDate(reminderDate.getDate() - daysBefore)

      if (reminderDate > now) {
        await supabase.from('reminders').insert({
          user_id: sub.user_id,
          subscription_id: sub.id,
          reminder_type: 'renewal',
          reminder_date: reminderDate.toISOString(),
          is_sent: false,
        })
      }

      advancedCount++
    }

    return NextResponse.json({
      message: `Advanced ${advancedCount} subscriptions`,
      advanced: advancedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
