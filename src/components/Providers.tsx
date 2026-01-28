'use client'

import { ReactNode } from 'react'
import { AuthProvider, SheetsProvider, EntriesProvider, ScheduleProvider } from '@/hooks'
import { ConfirmProvider, InputDialogProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
