'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { useAuth } from '@/hooks'
import { NavBar } from '@/components/layout'
import { ScheduleTable } from '@/components/schedule'
import { LoadingScreen } from '@/components/ui'

export default function SchedulePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">מערכת שעות</h1>
            <p className="text-gray-500 text-sm">ניהול מערכת השעות השבועית שלך</p>
          </div>
        </header>

        <ScheduleTable />
      </main>
    </div>
  )
}
