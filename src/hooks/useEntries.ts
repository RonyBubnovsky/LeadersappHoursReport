'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateDuration } from '@/lib/calculations'
import type { Entry, CreateEntryInput } from '@/types'

/**
 * Hook for managing entries data for a specific sheet.
 */
export function useEntries(sheetId: string | null) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    if (!sheetId) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('sheet_id', sheetId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [supabase, sheetId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const createEntry = async (input: CreateEntryInput) => {
    const { total_hours, pay_hours } = calculateDuration(input.start_time, input.end_time)
    
    const { data, error } = await supabase
      .from('entries')
      .insert({
        ...input,
        total_hours,
        pay_hours,
      })
      .select()
      .single()

    if (error) throw error
    setEntries(prev => [data, ...prev])
    return data
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const totalPayHours = entries.reduce((sum, entry) => sum + entry.pay_hours, 0)

  return {
    entries,
    loading,
    error,
    createEntry,
    deleteEntry,
    refetch: fetchEntries,
    totalPayHours,
  }
}
