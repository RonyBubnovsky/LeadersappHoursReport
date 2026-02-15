'use client'

import { ReactNode } from 'react'
import { AuthProvider, SheetsProvider, EntriesProvider, ScheduleProvider, SavedExportsProvider, AdminProvider, AttendanceLinksProvider } from '@/hooks'
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
                  <AdminProvider>
                    <AttendanceLinksProvider>
                      {children}
                    </AttendanceLinksProvider>
                  </AdminProvider>
                </SavedExportsProvider>
              </ScheduleProvider>
            </EntriesProvider>
          </SheetsProvider>
        </InputDialogProvider>
      </ConfirmProvider>
    </AuthProvider>
  )
}

