'use client'

import { useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import { Button, useInputDialog } from '@/components/ui'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useSchedule } from '@/hooks'
import { exportScheduleToExcel } from '@/lib/excel'

export function ScheduleActions() {
  const { entries, clearAll } = useSchedule()
  const confirm = useConfirm()
  const promptInput = useInputDialog()
  const [isClearing, setIsClearing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Don't show buttons if there are no entries
  if (entries.length === 0) {
    return null
  }

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'נקה את כל המערכת',
      message: 'האם אתה בטוח שברצונך למחוק את כל הנתונים במערכת השעות? פעולה זו לא ניתנת לביטול.',
      confirmText: 'נקה הכל',
      cancelText: 'ביטול',
      variant: 'danger'
    })

    if (confirmed) {
      setIsClearing(true)
      try {
        await clearAll()
      } catch (error) {
        console.error('Failed to clear schedule:', error)
      }
      setIsClearing(false)
    }
  }

  const handleExport = async () => {
    const filename = await promptInput({
      title: 'שם הקובץ',
      message: 'הזן שם לקובץ האקסל',
      placeholder: 'מערכת_שעות',
      defaultValue: 'מערכת_שעות',
      confirmText: 'ייצא',
      cancelText: 'ביטול',
    })
    
    if (filename) {
      setIsExporting(true)
      try {
        await exportScheduleToExcel(entries, filename)
      } catch (error) {
        console.error('Failed to export schedule:', error)
      }
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
      <Button
        variant="danger"
        size="sm"
        onClick={handleClearAll}
        isLoading={isClearing}
        className="flex-1 md:flex-none min-w-[100px]"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">נקה הכל</span>
        <span className="sm:hidden">נקה</span>
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleExport}
        isLoading={isExporting}
        className="flex-1 md:flex-none min-w-[100px] bg-green-600 hover:bg-green-700 focus:ring-green-500"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">ייצא לאקסל</span>
        <span className="sm:hidden">ייצא</span>
      </Button>
    </div>
  )
}
