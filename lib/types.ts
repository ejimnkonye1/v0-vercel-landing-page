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

// AI Advisor Types
export type AIInsightType = 'success' | 'warning' | 'error' | 'info'
export type AIRecommendationAction = 'keep' | 'cancel' | 'downgrade' | 'review'

export interface AIInsight {
  type: AIInsightType
  message: string
}

export interface AIRecommendation {
  subscriptionName: string
  action: AIRecommendationAction
  reason: string
  potentialSavings: number
  alternative?: string
}

export interface AIAdvisorAnalysis {
  summary: string
  totalPotentialSavings: number
  insights: AIInsight[]
  recommendations: AIRecommendation[]
  tips: string[]
}

export interface AIAdvisorResponse {
  success: boolean
  analysis?: AIAdvisorAnalysis
  error?: string
}

// Price Change Detector Types
export interface PriceHistory {
  id: string
  subscription_id: string
  user_id: string
  old_price: number
  new_price: number
  billing_cycle: BillingCycle
  changed_at: string
}

export interface CrowdsourcedPrice {
  id: string
  service_name: string
  billing_cycle: BillingCycle
  avg_price: number
  min_price: number
  max_price: number
  report_count: number
  last_reported: string
  created_at: string
  updated_at: string
}

export interface PriceAlert {
  subscriptionId: string
  subscriptionName: string
  yourPrice: number
  communityAvgPrice: number
  communityMinPrice: number
  communityMaxPrice: number
  priceDifference: number
  percentageDiff: number
  billingCycle: BillingCycle
  reportCount: number
  alertType: 'overpaying' | 'underpaying' | 'price_increased' | 'price_decreased'
}
