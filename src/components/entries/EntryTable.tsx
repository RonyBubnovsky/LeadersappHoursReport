'use client'

import { Trash2 } from 'lucide-react'
import { useEntries } from '@/hooks'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface EntryTableProps {
  sheetId: string
}

export function EntryTable({ sheetId }: EntryTableProps) {
  const { entries, loading, deleteEntry, totalPayHours } = useEntries(sheetId)

  if (loading) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-slate-500">
          טוען נתונים...
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center text-slate-500">
          אין רשומות עדיין. הוסף את הראשונה למעלה.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="bordered">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>רשומות</CardTitle>
        <div className="text-sm text-slate-400">
          סה״כ שעות לתשלום: <span className="text-sky-400 font-semibold">{totalPayHours.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">שם הכיתה</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">תאריך</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">התחלה</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">סיום</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">סה״כ</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">לתשלום</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-white">{entry.class_name}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.date_str}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.start_time}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.end_time}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.total_hours}</td>
                  <td className="py-3 px-4 text-sky-400 font-medium">{entry.pay_hours.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
