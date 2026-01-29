'use client'

import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { Entry, CreateEntryInput } from '@/types'
import { Button, Input, Card, CardTitle } from '@/components/ui'

interface EditEntryDialogProps {
  entry: Entry
  isOpen: boolean
  onClose: () => void
  onSave: (entryId: string, updates: Partial<CreateEntryInput>) => Promise<void>
}

export function EditEntryDialog({ entry, isOpen, onClose, onSave }: EditEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateEntryInput>>({
    class_name: '',
    date_str: '',
    start_time: '',
    end_time: '',
  })

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        class_name: entry.class_name,
        date_str: entry.date_str,
        start_time: entry.start_time,
        end_time: entry.end_time,
      })
    }
  }, [entry])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(entry.id, formData)
      onClose()
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
    setIsSubmitting(false)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
      
      <Card 
        className="relative text-right bg-white w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <CardTitle>עריכת רשומה</CardTitle>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="שם הכיתה / פעילות"
              value={formData.class_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
              required
            />
            <Input
              label="תאריך"
              value={formData.date_str || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, date_str: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="שעת התחלה"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              value={formData.start_time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
            />
            <Input
              label="שעת סיום"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              value={formData.end_time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="flex-1"
            >
              <Save className="w-4 h-4" />
              שמור שינויים
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
