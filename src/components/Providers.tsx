'use client'

import { ReactNode } from 'react'
import { SheetsProvider, EntriesProvider } from '@/hooks'
import { ConfirmProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <SheetsProvider>
        <EntriesProvider>
          {children}
        </EntriesProvider>
      </SheetsProvider>
    </ConfirmProvider>
  )
}

