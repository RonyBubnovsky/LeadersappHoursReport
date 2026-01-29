'use client'

import { ReactNode } from 'react'
import { AuthProvider, SheetsProvider, EntriesProvider, ScheduleProvider, SavedExportsProvider } from '@/hooks'
import { ConfirmProvider, InputDialogProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <InputDialogProvider>
          <SheetsProvider>
            <EntriesProvider>
              <ScheduleProvider>
                <SavedExportsProvider>
                  {children}
                </SavedExportsProvider>
              </ScheduleProvider>
            </EntriesProvider>
          </SheetsProvider>
        </InputDialogProvider>
      </ConfirmProvider>
    </AuthProvider>
  )
}
