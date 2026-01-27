'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sheet } from '@/types'

/**
 * Hook for managing sheets data.
 */
export function useSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSheets = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('sheets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setSheets(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSheets()
  }, [fetchSheets])

  const createSheet = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('sheets')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setSheets(prev => [data, ...prev])
    return data
  }

  const deleteSheet = async (id: string) => {
    const { error } = await supabase
      .from('sheets')
      .delete()
      .eq('id', id)

    if (error) throw error
    setSheets(prev => prev.filter(s => s.id !== id))
  }

  return {
    sheets,
    loading,
    error,
    createSheet,
    deleteSheet,
    refetch: fetchSheets,
  }
}
