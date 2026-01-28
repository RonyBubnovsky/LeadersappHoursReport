'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useEntries } from '@/hooks'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface EntryFormProps {
  sheetId: string
}

export function EntryForm({ sheetId }: EntryFormProps) {
  const { createEntry } = useEntries(sheetId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    class_name: '',
    date_str: '',
    start_time: '08:00',
    end_time: '09:00',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.class_name || !formData.date_str) return
    
    setIsSubmitting(true)
    try {
      await createEntry({
        sheet_id: sheetId,
        ...formData,
      })
      setFormData({
        class_name: '',
        date_str: '',
        start_time: '08:00',
        end_time: '09:00',
      })
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
    setIsSubmitting(false)
  }

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>הוספת רשומה חדשה</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="שם הכיתה / פעילות"
              placeholder="לדוגמה: כיתה ג׳1"
              value={formData.class_name}
              onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
              required
            />
            <Input
              label="תאריך"
              placeholder="לדוגמה: 15/01/2026"
              value={formData.date_str}
              onChange={(e) => setFormData(prev => ({ ...prev, date_str: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="שעת התחלה"
              placeholder="לדוגמה: 08:00"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
            />
            <Input
              label="שעת סיום"
              placeholder="לדוגמה: 09:00"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              value={formData.end_time}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
            <Plus className="w-4 h-4" />
            הוסף רשומה
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
