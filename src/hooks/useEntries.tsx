'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateDuration } from '@/lib/calculations'
import type { Entry, CreateEntryInput } from '@/types'

interface EntriesState {
  entries: Entry[]
  loading: boolean
  error: string | null
  totalPayHours: number
}

interface EntriesContextType {
  getEntriesForSheet: (sheetId: string) => EntriesState
  fetchEntriesForSheet: (sheetId: string) => void
  createEntry: (input: CreateEntryInput) => Promise<Entry>
  deleteEntry: (sheetId: string, entryId: string) => Promise<void>
  deleteAllEntries: (sheetId: string) => Promise<void>
}

const EntriesContext = createContext<EntriesContextType | null>(null)

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entriesBySheet, setEntriesBySheet] = useState<Record<string, Entry[]>>({})
  const [loadingSheets, setLoadingSheets] = useState<Set<string>>(new Set())
  const [fetchedSheets, setFetchedSheets] = useState<Set<string>>(new Set())
  const fetchingRef = useRef<Set<string>>(new Set())
  const supabase = createClient()

  const fetchEntriesForSheet = useCallback((sheetId: string) => {
    // Use ref to track in-flight fetches to avoid duplicate requests
    if (fetchedSheets.has(sheetId) || fetchingRef.current.has(sheetId)) return
    
    fetchingRef.current.add(sheetId)
    setLoadingSheets(prev => new Set(prev).add(sheetId))
    
    supabase
      .from('entries')
      .select('*')
      .eq('sheet_id', sheetId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setEntriesBySheet(prev => ({ ...prev, [sheetId]: data }))
        }
        
        setFetchedSheets(prev => new Set(prev).add(sheetId))
        setLoadingSheets(prev => {
          const next = new Set(prev)
          next.delete(sheetId)
          return next
        })
        fetchingRef.current.delete(sheetId)
      })
  }, [supabase, fetchedSheets])

  const getEntriesForSheet = useCallback((sheetId: string): EntriesState => {
    // Just return current state - don't trigger fetches here (causes setState during render)
    const entries = entriesBySheet[sheetId] || []
    const totalPayHours = entries.reduce((sum, entry) => sum + entry.pay_hours, 0)
    
    return {
      entries,
      loading: loadingSheets.has(sheetId),
      error: null,
      totalPayHours,
    }
  }, [entriesBySheet, loadingSheets])

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
    
    setEntriesBySheet(prev => ({
      ...prev,
      [input.sheet_id]: [...(prev[input.sheet_id] || []), data]
    }))
    
    return data
  }

  const deleteEntry = async (sheetId: string, entryId: string) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
    
    setEntriesBySheet(prev => ({
      ...prev,
      [sheetId]: (prev[sheetId] || []).filter(e => e.id !== entryId)
    }))
  }

  const deleteAllEntries = async (sheetId: string) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('sheet_id', sheetId)

    if (error) throw error
    
    setEntriesBySheet(prev => ({
      ...prev,
      [sheetId]: []
    }))
  }

  const value = useMemo(() => ({
    getEntriesForSheet,
    fetchEntriesForSheet,
    createEntry,
    deleteEntry,
    deleteAllEntries,
  }), [getEntriesForSheet, fetchEntriesForSheet])

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries(sheetId: string | null) {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  
  // Trigger fetch in useEffect - NOT during render
  useEffect(() => {
    if (sheetId) {
      context.fetchEntriesForSheet(sheetId)
    }
  }, [sheetId, context])
  
  const state = sheetId ? context.getEntriesForSheet(sheetId) : {
    entries: [],
    loading: false,
    error: null,
    totalPayHours: 0,
  }
  
  return {
    ...state,
    createEntry: context.createEntry,
    deleteEntry: (entryId: string) => sheetId ? context.deleteEntry(sheetId, entryId) : Promise.resolve(),
    deleteAllEntries: () => sheetId ? context.deleteAllEntries(sheetId) : Promise.resolve(),
  }
}
