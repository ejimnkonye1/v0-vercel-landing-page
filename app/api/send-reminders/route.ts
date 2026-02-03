import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all unsent reminders where reminder_date is today or earlier
    const now = new Date().toISOString()

    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select('*, subscription:subscriptions(*)')
      .eq('is_sent', false)
      .lte('reminder_date', now)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', sent: 0 })
    }

    // Group reminders by user_id to batch emails per user
    const remindersByUser: Record<string, typeof reminders> = {}
    for (const reminder of reminders) {
      if (!remindersByUser[reminder.user_id]) {
        remindersByUser[reminder.user_id] = []
      }
      remindersByUser[reminder.user_id].push(reminder)
    }

    let sentCount = 0
    const errors: string[] = []

    for (const [userId, userReminders] of Object.entries(remindersByUser)) {
      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

      if (userError || !userData?.user?.email) {
        errors.push(`Could not get email for user ${userId}`)
        continue
      }

      const email = userData.user.email

      // Fetch user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      const emailRenewalEnabled = prefs?.email_reminders_renewal ?? true
      const emailTrialEnabled = prefs?.email_reminders_trial ?? true

      // Filter reminders based on preferences
      const filteredReminders = userReminders.filter((r) => {
        if (r.reminder_type === 'renewal' && !emailRenewalEnabled) return false
        if (r.reminder_type === 'trial_ending' && !emailTrialEnabled) return false
        return true
      })

      // Mark filtered-out reminders as sent so they don't pile up
      const skippedIds = userReminders
        .filter((r) => !filteredReminders.includes(r))
        .map((r) => r.id)
      if (skippedIds.length > 0) {
        await supabase
          .from('reminders')
          .update({ is_sent: true })
          .in('id', skippedIds)
      }

      if (filteredReminders.length === 0) continue

      // Build email content for filtered reminders
      const reminderItems = filteredReminders.map((r) => {
        const sub = r.subscription
        const subName = sub?.name || 'Unknown subscription'
        const cost = sub?.cost ? `$${sub.cost.toFixed(2)}` : ''
        const cycle = sub?.billing_cycle === 'yearly' ? '/yr' : '/mo'
        const renewalDate = sub?.renewal_date
          ? new Date(sub.renewal_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : ''

        if (r.reminder_type === 'trial_ending') {
          return `<tr>
            <td style="padding: 16px; border-bottom: 1px solid #1A1A1A;">
              <strong style="color: #ffffff;">${subName}</strong>
              <br><span style="color: #999999; font-size: 14px;">Trial ending soon${cost ? ` - converts to ${cost}${cycle}` : ''}</span>
              ${sub?.trial_end_date ? `<br><span style="color: #666666; font-size: 13px;">Trial ends: ${new Date(sub.trial_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>` : ''}
            </td>
          </tr>`
        }

        return `<tr>
          <td style="padding: 16px; border-bottom: 1px solid #1A1A1A;">
            <strong style="color: #ffffff;">${subName}</strong>
            <br><span style="color: #999999; font-size: 14px;">Renewal: ${renewalDate}${cost ? ` - ${cost}${cycle}` : ''}</span>
          </td>
        </tr>`
      }).join('')

      const htmlBody = `
        <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: #ffffff; width: 40px; height: 40px; border-radius: 8px; line-height: 40px; font-weight: bold; color: #000000; font-size: 18px;">S</div>
              <h1 style="color: #ffffff; font-size: 20px; margin: 16px 0 8px 0;">Subscription Reminder</h1>
              <p style="color: #666666; font-size: 14px; margin: 0;">You have upcoming renewals</p>
            </div>

            <div style="background: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 12px; overflow: hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${reminderItems}
              </table>
            </div>

            <p style="color: #444444; font-size: 13px; text-align: center; margin-top: 24px;">
              Manage your subscriptions at SubTracker
            </p>
          </div>
        </div>
      `

      try {
        await resend.emails.send({
          from: 'SubTracker <onboarding@resend.dev>',
          to: email,
          subject: `Reminder: ${filteredReminders.length === 1 ? `${filteredReminders[0].subscription?.name || 'Subscription'} renewal coming up` : `${filteredReminders.length} subscriptions renewing soon`}`,
          html: htmlBody,
        })

        // Mark all sent reminders as sent
        const reminderIds = filteredReminders.map((r) => r.id)
        await supabase
          .from('reminders')
          .update({ is_sent: true })
          .in('id', reminderIds)

        sentCount += filteredReminders.length
      } catch (emailError: any) {
        errors.push(`Failed to send email to ${email}: ${emailError.message}`)
      }
    }

    return NextResponse.json({
      message: `Processed ${reminders.length} reminders`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
