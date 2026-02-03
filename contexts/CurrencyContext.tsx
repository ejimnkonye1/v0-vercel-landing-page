'use client'

import { createContext, useContext, ReactNode } from 'react'
import { usePreferences } from '@/hooks/usePreferences'
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/currency'
import type { Currency } from '@/lib/types'

interface CurrencyContextType {
  currency: Currency
  formatAmount: (amount: number) => string
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  formatAmount: (amount) => formatCurrencyUtil(amount, 'USD'),
  symbol: '$',
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences()
  const currency = preferences.currency || 'USD'

  const formatAmount = (amount: number) => formatCurrencyUtil(amount, currency)
  const symbol = getCurrencySymbol(currency)

  return (
    <CurrencyContext.Provider value={{ currency, formatAmount, symbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
