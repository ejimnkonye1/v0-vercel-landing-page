import type { Currency } from './types'

export const CURRENCIES: Record<Currency, { symbol: string; locale: string; name: string }> = {
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  CAD: { symbol: 'CA$', locale: 'en-CA', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
  JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  NGN: { symbol: '₦', locale: 'en-NG', name: 'Nigerian Naira' },
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const config = CURRENCIES[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount)
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name
}
