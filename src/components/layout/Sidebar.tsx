'use client'

import { useState } from 'react'
import { Plus, FileSpreadsheet, ChevronLeft, LogOut, BarChart3 } from 'lucide-react'
import { useAuth, useSheets } from '@/hooks'
import { Button, Input } from '@/components/ui'
import type { Sheet } from '@/types'

interface SidebarProps {
  selectedSheet: Sheet | null
  onSelectSheet: (sheet: Sheet | null) => void
  onShowSummary: () => void
  showSummary: boolean
}

export function Sidebar({ selectedSheet, onSelectSheet, onShowSummary, showSummary }: SidebarProps) {
  const { user, signOut } = useAuth()
  const { sheets, loading, createSheet } = useSheets()
  const [newSheetName, setNewSheetName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSheet = async () => {
    if (!newSheetName.trim()) return
    setIsCreating(true)
    try {
      const sheet = await createSheet(newSheetName.trim())
      setNewSheetName('')
      onSelectSheet(sheet)
    } catch (error) {
      console.error('Failed to create sheet:', error)
    }
    setIsCreating(false)
  }

  return (
    <aside className="w-72 h-screen bg-slate-900/50 border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-sky-400" />
          גיליונות
        </h2>
      </div>

      {/* Create new sheet */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <Input
          placeholder="שם הגיליון..."
          value={newSheetName}
          onChange={(e) => setNewSheetName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateSheet()}
        />
        <Button
          onClick={handleCreateSheet}
          isLoading={isCreating}
          disabled={!newSheetName.trim()}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          צור גיליון
        </Button>
      </div>

      {/* Sheets list */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-4 text-center text-slate-500">טוען...</div>
        ) : sheets.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            עדיין אין גיליונות. צור את הראשון!
          </div>
        ) : (
          <nav className="space-y-1">
            {sheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => {
                  onSelectSheet(sheet)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedSheet?.id === sheet.id && !showSummary
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate">{sheet.name}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Summary button */}
      <div className="p-3 border-t border-slate-800">
        <Button
          onClick={onShowSummary}
          variant={showSummary ? 'primary' : 'secondary'}
          className="w-full"
          size="sm"
        >
          <BarChart3 className="w-4 h-4" />
          סיכום כללי
        </Button>
      </div>

      {/* User info & logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-sm text-slate-400 truncate max-w-[140px]">
          {user?.email}
        </span>
        <Button onClick={signOut} variant="ghost" size="sm">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  )
}
