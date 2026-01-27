'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Clock, Download, Trash2 } from 'lucide-react'
import { useAuth, useSheets, useEntries } from '@/hooks'
import { Sidebar } from '@/components/layout'
import { EntryForm, EntryTable } from '@/components/entries'
import { Button, Card, CardContent } from '@/components/ui'
import { exportToExcel, exportAllToExcel } from '@/lib/excel'
import type { Sheet } from '@/types'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { sheets, deleteSheet } = useSheets()
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const { entries } = useEntries(selectedSheet?.id ?? null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login')
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">טוען...</div>
      </div>
    )
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
    await exportAllToExcel(sheets)
  }

  const handleDelete = async () => {
    if (!selectedSheet) return
    if (confirm('האם אתה בטוח שברצונך למחוק גיליון זה?')) {
      await deleteSheet(selectedSheet.id)
      setSelectedSheet(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {showSummary ? 'סיכום כללי' : selectedSheet?.name || 'מערכת ניהול שעות'}
                </h1>
                <p className="text-slate-400 text-sm">ניהול שעות עבודה ותשלומים</p>
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
                <>
                  <Button onClick={handleExport} variant="secondary">
                    <Download className="w-4 h-4" />
                    ייצא
                  </Button>
                  <Button onClick={handleDelete} variant="danger">
                    <Trash2 className="w-4 h-4" />
                    מחק
                  </Button>
                </>
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
        <h2 className="text-lg font-semibold text-white mb-4">סיכום כל הגיליונות</h2>
        {sheets.length === 0 ? (
          <p className="text-slate-400">אין גיליונות להצגה</p>
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
      <span className="text-white">{sheet.name}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-slate-400">{entries.length} רשומות</span>
        <span className="text-sky-400 font-medium">{totalPayHours.toFixed(2)} שעות</span>
      </div>
    </div>
  )
}

function WelcomeView() {
  return (
    <Card variant="glass" className="text-center py-16">
      <CardContent>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 mb-6">
          <Clock className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">ברוכים הבאים!</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          צור גיליון חדש מהתפריט כדי להתחיל לנהל את שעות העבודה שלך
        </p>
      </CardContent>
    </Card>
  )
}
