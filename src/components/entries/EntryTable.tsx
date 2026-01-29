'use client'

import { useState } from 'react'
import { Trash2, Edit2 } from 'lucide-react'
import { useEntries } from '@/hooks'
import { Button, Card, CardHeader, CardTitle, CardContent, useConfirm } from '@/components/ui'
import { EditEntryDialog } from './EditEntryDialog'
import { Entry } from '@/types'

interface EntryTableProps {
  sheetId: string
}

export function EntryTable({ sheetId }: EntryTableProps) {
  const { entries, loading, deleteEntry, deleteAllEntries, updateEntry, totalPayHours } = useEntries(sheetId)
  const confirm = useConfirm()
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const handleDeleteAll = async () => {
    const confirmed = await confirm({
      title: 'מחיקת כל הרשומות',
      message: 'האם אתה בטוח שברצונך למחוק את כל הרשומות בגיליון זה? פעולה זו אינה ניתנת לביטול.',
      confirmText: 'מחק הכל',
      cancelText: 'ביטול',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteAllEntries()
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    const confirmed = await confirm({
      title: 'מחיקת רשומה',
      message: 'האם אתה בטוח שברצונך למחוק רשומה זו?',
      confirmText: 'מחק',
      cancelText: 'ביטול',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteEntry(entryId)
    }
  }

  if (loading) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-gray-500">
          טוען נתונים...
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-gray-500">
          אין רשומות עדיין. הוסף את הראשונה למעלה.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="bordered">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <CardTitle>רשומות</CardTitle>
          <Button onClick={handleDeleteAll} variant="danger" size="sm">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">מחק הכל</span>
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          סה״כ שעות לתשלום: <span className="text-blue-600 font-semibold">{totalPayHours.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View - hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">שם הכיתה</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">תאריך</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">התחלה</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">סיום</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">סה״כ</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">לתשלום</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-900 text-right">{entry.class_name}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{entry.date_str}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{entry.start_time}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{entry.end_time}</td>
                  <td className="py-3 px-4 text-gray-600 text-right">{entry.total_hours}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium text-right">{entry.pay_hours.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEntry(entry)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - hidden on desktop */}
        <div className="md:hidden space-y-3">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              {/* Entry header with name and actions */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{entry.class_name}</div>
                  <div className="text-sm text-gray-500">{entry.date_str}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEntry(entry)}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Entry details grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">שעות: </span>
                  <span className="text-gray-700">{entry.start_time} - {entry.end_time}</span>
                </div>
                <div>
                  <span className="text-gray-500">סה״כ: </span>
                  <span className="text-gray-700">{entry.total_hours}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">לתשלום: </span>
                  <span className="text-blue-600 font-semibold">{entry.pay_hours.toFixed(2)} שעות</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={async (entryId, updates) => {
            await updateEntry(entryId, updates)
          }}
        />
      )}
    </Card>
  )
}

