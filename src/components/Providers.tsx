'use client'

import { ReactNode } from 'react'
import { Toaster } from 'sonner'
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
                      <Toaster
                        position="top-center"
                        dir="rtl"
                        richColors
                        toastOptions={{
                          style: {
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            direction: 'rtl',
                          },
                        }}
                      />
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

