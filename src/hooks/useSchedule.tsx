'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export interface ScheduleEntry {
  id?: string
  day_index: number
  time_slot: number
  content: string
}

interface ScheduleContextType {
  entries: ScheduleEntry[]
  loading: boolean
  error: string | null
  updateEntry: (dayIndex: number, timeSlot: number, content: string) => Promise<void>
  getEntry: (dayIndex: number, timeSlot: number) => string
  refetch: () => Promise<void>
  clearAll: () => Promise<void>
}

const ScheduleContext = createContext<ScheduleContextType | null>(null)

export const TIME_SLOTS = [
  '8:00-9:00',
  '9:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
]

export const DAYS = ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳']

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchEntries = useCallback(async (force = false) => {
    if (!user) {
      setLoading(false)
      return
    }
    
    // Skip if already fetched (unless forced)
    if (hasFetched && !force) {
      return
    }
    
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setEntries(data || [])
      setHasFetched(true)
    }
    setLoading(false)
  }, [supabase, user, hasFetched])

  // Don't auto-fetch on mount - let the schedule page trigger the fetch

  const updateEntry = async (dayIndex: number, timeSlot: number, content: string) => {
    if (!user) throw new Error('Not authenticated')

    const existingEntry = entries.find(
      e => e.day_index === dayIndex && e.time_slot === timeSlot
    )

    if (content.trim() === '') {
      // Delete if content is empty
      if (existingEntry?.id) {
        const { error } = await supabase
          .from('schedule_entries')
          .delete()
          .eq('id', existingEntry.id)

        if (error) throw error
        setEntries(prev => prev.filter(e => e.id !== existingEntry.id))
      }
    } else if (existingEntry?.id) {
      // Update existing
      const { error } = await supabase
        .from('schedule_entries')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existingEntry.id)

      if (error) throw error
      setEntries(prev =>
        prev.map(e =>
          e.id === existingEntry.id ? { ...e, content } : e
        )
      )
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('schedule_entries')
        .insert({
          user_id: user.id,
          day_index: dayIndex,
          time_slot: timeSlot,
          content,
        })
        .select()
        .single()

      if (error) throw error
      setEntries(prev => [...prev, data])
    }
  }

  const clearAll = async () => {
    if (!user) throw new Error('Not authenticated')
    if (entries.length === 0) return

    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error
    setEntries([])
  }

  const getEntry = (dayIndex: number, timeSlot: number): string => {
    const entry = entries.find(
      e => e.day_index === dayIndex && e.time_slot === timeSlot
    )
    return entry?.content || ''
  }

  return (
    <ScheduleContext.Provider value={{ entries, loading, error, updateEntry, getEntry, refetch: fetchEntries, clearAll }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }
  return context
}
