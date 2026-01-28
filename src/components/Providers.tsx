'use client'

import { ReactNode } from 'react'
import { SheetsProvider, EntriesProvider, ScheduleProvider } from '@/hooks'
import { ConfirmProvider, InputDialogProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <InputDialogProvider>
        <SheetsProvider>
          <EntriesProvider>
            <ScheduleProvider>
              {children}
            </ScheduleProvider>
          </EntriesProvider>
        </SheetsProvider>
      </InputDialogProvider>
    </ConfirmProvider>
  )
}
