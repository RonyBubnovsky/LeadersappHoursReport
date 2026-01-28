'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sheet } from '@/types'

interface SheetsContextType {
  sheets: Sheet[]
  loading: boolean
  error: string | null
  createSheet: (name: string) => Promise<Sheet>
  deleteSheet: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const SheetsContext = createContext<SheetsContextType | null>(null)

export function SheetsProvider({ children }: { children: ReactNode }) {
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

  return (
    <SheetsContext.Provider value={{ sheets, loading, error, createSheet, deleteSheet, refetch: fetchSheets }}>
      {children}
    </SheetsContext.Provider>
  )
}

export function useSheets() {
  const context = useContext(SheetsContext)
  if (!context) {
    throw new Error('useSheets must be used within a SheetsProvider')
  }
  return context
}
