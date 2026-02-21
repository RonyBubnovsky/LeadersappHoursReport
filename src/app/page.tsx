'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, Download, Trash2, Menu } from 'lucide-react'
import { useAuth, useSheets, useEntries, useSidebarState, useSavedExports, useAllSheetsTotalHours } from '@/hooks'
import { Sidebar, NavBar } from '@/components/layout'
import { EntryForm, EntryTable } from '@/components/entries'
import { Button, Card, CardContent, useConfirm, useInputDialog, LoadingScreen } from '@/components/ui'
import { exportToExcel, exportAllToExcel } from '@/lib/excel'
import type { Sheet } from '@/types'

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { sheets, deleteSheet, refetch: refetchSheets } = useSheets()
  const { addExport } = useSavedExports()
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const { entries } = useEntries(selectedSheet?.id ?? null)
  const confirm = useConfirm()
  const promptInput = useInputDialog()
  
  // Mobile sidebar state
  const { isMobile, isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebarState()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Show success toast when arriving from email verification
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('האימייל אומת בהצלחה! ברוך הבא', {
        duration: 3000,
      })
      router.replace('/', { scroll: false })
    }
  }, [searchParams, router])

  // Lazy load sheets when visiting home page
  useEffect(() => {
    refetchSheets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync selectedSheet with sheets array (e.g., when sheet name is updated)
  useEffect(() => {
    if (selectedSheet) {
      const updatedSheet = sheets.find(s => s.id === selectedSheet.id)
      if (updatedSheet && updatedSheet.name !== selectedSheet.name) {
        setSelectedSheet(updatedSheet)
      }
    }
  }, [sheets, selectedSheet])

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) return null

  const handleSelectSheet = (sheet: Sheet | null) => {
    setSelectedSheet(sheet)
    setShowSummary(false)
  }

  const handleShowSummary = () => {
    setShowSummary(true)
    setSelectedSheet(null)
  }

  const handleExport = async () => {
    if (!selectedSheet || entries.length === 0) return
    await exportToExcel(entries, selectedSheet.name)
  }

  const handleExportAll = async () => {
    const filename = await promptInput({
      title: 'שם הקובץ',
      message: 'הזן שם לקובץ האקסל',
      placeholder: 'דוח_שעות',
      defaultValue: 'דוח_מלא',
      confirmText: 'ייצא',
      cancelText: 'ביטול',
    })
    if (filename) {
      await exportAllToExcel(sheets, filename, {
        saveToCloud: true,
        userId: user?.id,
        onSuccess: addExport
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedSheet) return
    const confirmed = await confirm({
      title: 'מחיקת גיליון',
      message: `האם אתה בטוח שברצונך למחוק את הגיליון "${selectedSheet.name}"? כל הרשומות בגיליון יימחקו גם.`,
      confirmText: 'מחק גיליון',
      cancelText: 'ביטול',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteSheet(selectedSheet.id)
      setSelectedSheet(null)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - hidden on mobile, shown as drawer when toggled */}
        {isMobile ? (
          // Only render mobile sidebar when it's open
          sidebarOpen && (
            <Sidebar
              selectedSheet={selectedSheet}
              onSelectSheet={handleSelectSheet}
              onShowSummary={handleShowSummary}
              showSummary={showSummary}
              isMobile={true}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
          )
        ) : (
          <div className="hidden md:flex h-full">
            <Sidebar
              selectedSheet={selectedSheet}
              onSelectSheet={handleSelectSheet}
              onShowSummary={handleShowSummary}
              showSummary={showSummary}
            />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {/* Header - responsive layout */}
            <header className="mb-6 md:mb-8">
              {/* Top row with hamburger, title */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Hamburger menu button - only on mobile */}
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleSidebar}
                      className="p-2"
                    >
                      <Menu className="w-6 h-6" />
                    </Button>
                  )}
                  <div className="p-2 rounded-xl bg-blue-600">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900 line-clamp-1">
                      {showSummary ? 'סיכום כללי' : selectedSheet?.name || 'דיווח שעות'}
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm hidden sm:block">ניהול שעות עבודה ותשלומים</p>
                  </div>
                </div>
              </div>
              
              {/* Actions row - responsive */}
              <div className="flex flex-wrap gap-2">
                {showSummary && sheets.length > 0 && (
                  <Button onClick={handleExportAll} variant="secondary" size="sm">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">ייצא הכל</span>
                    <span className="sm:hidden">ייצא</span>
                  </Button>
                )}
                {selectedSheet && entries.length > 0 && (
                  <Button onClick={handleExport} variant="secondary" size="sm">
                    <Download className="w-4 h-4" />
                    ייצא
                  </Button>
                )}
                {selectedSheet && (
                  <Button onClick={handleDelete} variant="danger" size="sm">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">מחק</span>
                  </Button>
                )}
              </div>
            </header>

            {/* Content */}
            {showSummary ? (
              <SummaryView sheets={sheets} />
            ) : selectedSheet ? (
              <SheetView sheetId={selectedSheet.id} />
            ) : (
              <WelcomeView onOpenSidebar={isMobile ? toggleSidebar : undefined} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SheetView({ sheetId }: { sheetId: string }) {
  return (
    <div className="space-y-6">
      <EntryForm sheetId={sheetId} />
      <EntryTable sheetId={sheetId} />
    </div>
  )
}

function SummaryView({ sheets }: { sheets: Sheet[] }) {
  const totalHours = useAllSheetsTotalHours(sheets.map(s => s.id))
  
  return (
    <Card variant="bordered">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">סיכום כל הגיליונות</h2>
          {sheets.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 sm:justify-start">
              <span className="text-sm text-gray-600">סה״כ:</span>
              <span className="text-base font-semibold text-blue-700 sm:text-lg">{totalHours.toFixed(2)} שעות</span>
            </div>
          )}
        </div>
        {sheets.length === 0 ? (
          <p className="text-gray-500">אין גיליונות להצגה</p>
        ) : (
          <div className="space-y-2">
            {sheets.map(sheet => (
              <SheetSummaryRow key={sheet.id} sheet={sheet} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SheetSummaryRow({ sheet }: { sheet: Sheet }) {
  const { entries, totalPayHours } = useEntries(sheet.id)
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 gap-2">
      <span className="text-gray-900 font-medium">{sheet.name}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-gray-500">{entries.length} רשומות</span>
        <span className="text-blue-600 font-medium">{totalPayHours.toFixed(2)} שעות</span>
      </div>
    </div>
  )
}

function WelcomeView({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  return (
    <Card variant="bordered" className="text-center py-12 md:py-16">
      <CardContent>
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-50 mb-6">
          <Clock className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">ברוכים הבאים!</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
          {onOpenSidebar ? (
            <>
              לחץ על <button onClick={onOpenSidebar} className="text-blue-600 underline">התפריט</button> כדי ליצור גיליון חדש
            </>
          ) : (
            'צור גיליון חדש מהתפריט כדי להתחיל לנהל את שעות העבודה שלך'
          )}
        </p>
      </CardContent>
    </Card>
  )
}
