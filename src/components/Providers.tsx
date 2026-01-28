'use client'

import { ReactNode } from 'react'
import { SheetsProvider, EntriesProvider } from '@/hooks'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SheetsProvider>
      <EntriesProvider>
        {children}
      </EntriesProvider>
    </SheetsProvider>
  )
}
