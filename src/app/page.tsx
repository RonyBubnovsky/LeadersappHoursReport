'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Clock, Download, Trash2 } from 'lucide-react'
import { useAuth, useSheets, useEntries } from '@/hooks'
import { Sidebar, NavBar } from '@/components/layout'
import { EntryForm, EntryTable } from '@/components/entries'
import { Button, Card, CardContent, useConfirm, useInputDialog, LoadingScreen } from '@/components/ui'
import { exportToExcel, exportAllToExcel } from '@/lib/excel'
import type { Sheet } from '@/types'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { sheets, deleteSheet } = useSheets()
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const { entries } = useEntries(selectedSheet?.id ?? null)
  const confirm = useConfirm()
  const promptInput = useInputDialog()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login')
    }
  }, [user, authLoading])

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
      await exportAllToExcel(sheets, filename)
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
      {/* Sidebar */}
      <Sidebar
        selectedSheet={selectedSheet}
        onSelectSheet={handleSelectSheet}
        onShowSummary={handleShowSummary}
        showSummary={showSummary}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {showSummary ? 'סיכום כללי' : selectedSheet?.name || 'דיווח שעות LeadersApp'}
                </h1>
                <p className="text-gray-500 text-sm">ניהול שעות עבודה ותשלומים</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              {showSummary && sheets.length > 0 && (
                <Button onClick={handleExportAll} variant="secondary">
                  <Download className="w-4 h-4" />
                  ייצא הכל
                </Button>
              )}
              {selectedSheet && entries.length > 0 && (
                <Button onClick={handleExport} variant="secondary">
                  <Download className="w-4 h-4" />
                  ייצא
                </Button>
              )}
              {selectedSheet && (
                <Button onClick={handleDelete} variant="danger">
                  <Trash2 className="w-4 h-4" />
                  מחק
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
            <WelcomeView />
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
  return (
    <Card variant="bordered">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">סיכום כל הגיליונות</h2>
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
      <span className="text-gray-900">{sheet.name}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-gray-500">{entries.length} רשומות</span>
        <span className="text-blue-600 font-medium">{totalPayHours.toFixed(2)} שעות</span>
      </div>
    </div>
  )
}

function WelcomeView() {
  return (
    <Card variant="bordered" className="text-center py-16">
      <CardContent>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 mb-6">
          <Clock className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">ברוכים הבאים!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          צור גיליון חדש מהתפריט כדי להתחיל לנהל את שעות העבודה שלך
        </p>
      </CardContent>
    </Card>
  )
}
