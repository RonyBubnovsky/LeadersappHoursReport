'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users } from 'lucide-react'
import { useAuth, useAdmin } from '@/hooks'
import { NavBar } from '@/components/layout'
import { Card, CardContent, LoadingScreen } from '@/components/ui'
import { UserList, AdminActions } from '@/components/admin'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, isChecking, checkAdminStatus, fetchUsers } = useAdmin()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user, checkAdminStatus])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, fetchUsers])

  if (authLoading || isChecking) {
    return <LoadingScreen />
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <Card variant="bordered" className="text-center py-16">
            <CardContent>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 mb-6">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">אין גישה</h2>
              <p className="text-gray-500">
                אין לך הרשאות לצפות בדף זה
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-600">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ניהול משתמשים</h1>
            <p className="text-gray-500 text-xs md:text-sm">צפייה והסרת משתמשים מהמערכת</p>
          </div>
        </header>

        <Card variant="bordered">
          <CardContent className="p-4 md:p-6">
            <AdminActions />
            <UserList />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
