'use client'

import { useState } from 'react'
import { Plus, FileSpreadsheet, ChevronRight, LogOut, BarChart3 } from 'lucide-react'
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
    <aside className="w-72 h-screen bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          גיליונות
        </h2>
      </div>

      {/* Create new sheet */}
      <div className="p-4 border-b border-gray-200 space-y-3">
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
          <div className="p-4 text-center text-gray-500">טוען...</div>
        ) : sheets.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedSheet?.id === sheet.id && !showSummary
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span className="truncate">{sheet.name}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Summary button */}
      <div className="p-3 border-t border-gray-200">
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
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {user?.user_metadata?.avatar_url && (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}
          <span className="text-sm text-gray-700 truncate">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
        <Button onClick={signOut} variant="ghost" size="sm">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  )
}
