export type BillingCycle = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'trial' | 'cancelled'
export type CancellationDifficulty = 'easy' | 'medium' | 'hard'
export type ReminderType = 'trial_ending' | 'renewal' | 'unused'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'NGN'

export interface Subscription {
  id: string
  user_id: string
  name: string
  category: string
  cost: number
  billing_cycle: BillingCycle
  renewal_date: string
  status: SubscriptionStatus
  trial_end_date: string | null
  cancellation_difficulty: CancellationDifficulty
  cancellation_link: string | null
  logo_identifier: string | null
  notes: string | null
  last_used: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  subscription_id: string
  reminder_type: ReminderType
  reminder_date: string
  is_sent: boolean
  created_at: string
  subscription?: Subscription
}

export interface SubscriptionFormData {
  name: string
  category: string
  cost: number
  billing_cycle: BillingCycle
  renewal_date: string
  status: SubscriptionStatus
  trial_end_date?: string | null
  cancellation_difficulty: CancellationDifficulty
  cancellation_link?: string | null
  logo_identifier?: string | null
  notes?: string | null
}

export interface UserProfile {
  id: string
  email: string
}

export type ReminderDaysBefore = 2 | 3 | 5 | 7

export interface UserPreferences {
  id: string
  user_id: string
  email_reminders_renewal: boolean
  email_reminders_trial: boolean
  in_app_reminders: boolean
  reminder_days_before: ReminderDaysBefore
  currency: Currency
  budget_enabled: boolean
  monthly_budget: number | null
  budget_alert_threshold: number
  created_at: string
  updated_at: string
}
