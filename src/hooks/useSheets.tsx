'use client'

import { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sheet } from '@/types'

interface SheetsContextType {
  sheets: Sheet[]
  loading: boolean
  error: string | null
  createSheet: (name: string) => Promise<Sheet>
  updateSheet: (id: string, name: string) => Promise<void>
  deleteSheet: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const SheetsContext = createContext<SheetsContextType | null>(null)

export function SheetsProvider({ children }: { children: ReactNode }) {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const isFetchingRef = useRef(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchSheets = useCallback(async (force = false) => {
    // Skip if already fetched (unless forced) or currently fetching
    if ((hasFetchedRef.current && !force) || isFetchingRef.current) {
      return
    }
    
    isFetchingRef.current = true
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('sheets')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setSheets(data || [])
      hasFetchedRef.current = true
    }
    setLoading(false)
    isFetchingRef.current = false
  }, [supabase])

  // No auto-fetch - let the home page trigger the fetch

  const createSheet = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('sheets')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setSheets(prev => [...prev, data])
    return data
  }

  const updateSheet = async (id: string, name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('sheets')
      .update({ name })
      .eq('id', id)

    if (error) throw error
    setSheets(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }

  const deleteSheet = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('sheets')
      .delete()
      .eq('id', id)

    if (error) throw error
    setSheets(prev => prev.filter(s => s.id !== id))
  }

  return (
    <SheetsContext.Provider value={{ sheets, loading, error, createSheet, updateSheet, deleteSheet, refetch: fetchSheets }}>
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
