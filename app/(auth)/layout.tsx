'use client'

import { StarfieldBackground } from '@/components/StarfieldBackground'
import { useTheme } from '@/lib/theme-context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isDark } = useTheme()
  
  return (
    <div className={isDark ? 'min-h-screen bg-black flex items-center justify-center px-4' : 'min-h-screen bg-white flex items-center justify-center px-4'}>
      <StarfieldBackground />
      {children}
    </div>
  )
}
