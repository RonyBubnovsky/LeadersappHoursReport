'use client'

import { ReactNode } from 'react'
import { SheetsProvider, EntriesProvider } from '@/hooks'
import { ConfirmProvider, InputDialogProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <InputDialogProvider>
        <SheetsProvider>
          <EntriesProvider>
            {children}
          </EntriesProvider>
        </SheetsProvider>
      </InputDialogProvider>
    </ConfirmProvider>
  )
}
