'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSchedule, TIME_SLOTS, DAYS } from '@/hooks'
import { ScheduleActions } from './ScheduleActions'

interface EditableCell {
  dayIndex: number
  timeSlot: number
}

export function ScheduleTable() {
  const { loading, error, updateEntry, getEntry, refetch } = useSchedule()
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  // Trigger fetch when component mounts (lazy loading)
  // The refetch function respects hasFetched, so it won't re-fetch if already loaded
  useEffect(() => {
    refetch()
  }, [refetch])

  const handleCellClick = (dayIndex: number, timeSlot: number) => {
    const currentValue = getEntry(dayIndex, timeSlot)
    setEditValue(currentValue)
    setEditingCell({ dayIndex, timeSlot })
  }

  const handleSave = useCallback(async () => {
    if (!editingCell) return
    
    setSaving(true)
    try {
      await updateEntry(editingCell.dayIndex, editingCell.timeSlot, editValue)
    } catch (err) {
      console.error('Failed to save:', err)
    }
    setSaving(false)
    setEditingCell(null)
  }, [editingCell, editValue, updateEntry])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">טוען מערכת שעות...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-red-500">שגיאה: {error}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Action buttons */}
      <ScheduleActions />

      {/* Mobile scroll hint */}
      <div className="md:hidden text-xs text-gray-400 text-center mb-2">
        ← גלול לצדדים לראות את כל הימים →
      </div>
      
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-600 w-16 md:w-28 sticky right-0 bg-gray-50 z-10">
                {/* Empty header for time column */}
              </th>
              {DAYS.map((day, index) => (
                <th
                  key={index}
                  className="border border-gray-200 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-900 min-w-[100px] md:min-w-[140px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeSlot, timeIndex) => (
              <tr key={timeIndex} className="hover:bg-gray-50/50 transition-colors">
                <td className="border border-gray-200 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 text-center sticky right-0 z-10">
                  {timeSlot}
                </td>
                {DAYS.map((_, dayIndex) => {
                  const isEditing =
                    editingCell?.dayIndex === dayIndex &&
                    editingCell?.timeSlot === timeIndex
                  const cellValue = getEntry(dayIndex, timeIndex)

                  return (
                    <td
                      key={dayIndex}
                      className={`border border-gray-200 px-1 md:px-2 py-1 text-xs md:text-sm transition-colors cursor-pointer ${
                        isEditing ? 'bg-blue-50' : cellValue ? 'bg-white' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !isEditing && handleCellClick(dayIndex, timeIndex)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSave}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          disabled={saving}
                          className="w-full px-1 md:px-2 py-1 md:py-1.5 text-xs md:text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="הזן תוכן..."
                        />
                      ) : (
                        <div className="min-h-[32px] md:min-h-[36px] px-1 md:px-2 py-1 md:py-1.5 flex items-center">
                          {cellValue || (
                            <span className="text-gray-300 text-xs">לחץ לעריכה</span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

