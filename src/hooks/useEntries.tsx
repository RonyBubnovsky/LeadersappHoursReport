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
  getTotalHoursForSheets: (sheetIds: string[]) => number
  fetchEntriesForSheet: (sheetId: string) => void
  createEntry: (input: CreateEntryInput) => Promise<Entry>
  deleteEntry: (sheetId: string, entryId: string) => Promise<void>
  deleteAllEntries: (sheetId: string) => Promise<void>
  updateEntry: (sheetId: string, entryId: string, updates: Partial<CreateEntryInput>) => Promise<Entry>
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
      .then(({ data, error }: { data: Entry[] | null, error: unknown }) => {
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

  const getTotalHoursForSheets = useCallback((sheetIds: string[]): number => {
    return sheetIds.reduce((sum, id) => {
      const entries = entriesBySheet[id] || []
      return sum + entries.reduce((s, e) => s + e.pay_hours, 0)
    }, 0)
  }, [entriesBySheet])

  const createEntry = async (input: CreateEntryInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

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

  const updateEntry = async (sheetId: string, entryId: string, updates: Partial<CreateEntryInput>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let calculatedUpdates: Partial<Entry> = { ...updates }
    
    // Recalculate duration if times are updated
    if (updates.start_time || updates.end_time) {
      // We need the original entry to get the missing time if only one is updated
      const currentEntry = entriesBySheet[sheetId]?.find(e => e.id === entryId)
      if (currentEntry) {
        const startTime = updates.start_time || currentEntry.start_time
        const endTime = updates.end_time || currentEntry.end_time
        const { total_hours, pay_hours } = calculateDuration(startTime, endTime)
        calculatedUpdates = {
          ...calculatedUpdates,
          total_hours,
          pay_hours
        }
      }
    }

    const { data, error } = await supabase
      .from('entries')
      .update(calculatedUpdates)
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error

    setEntriesBySheet(prev => ({
      ...prev,
      [sheetId]: (prev[sheetId] || []).map(e => e.id === entryId ? data : e)
    }))

    return data
  }

  const deleteAllEntries = async (sheetId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

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
    getTotalHoursForSheets,
    fetchEntriesForSheet,
    createEntry,
    deleteEntry,
    deleteAllEntries,
    updateEntry,
  }), [getEntriesForSheet, getTotalHoursForSheets, fetchEntriesForSheet])

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
    updateEntry: (entryId: string, updates: Partial<CreateEntryInput>) => sheetId ? context.updateEntry(sheetId, entryId, updates) : Promise.resolve({} as Entry),
  }
}

export function useAllSheetsTotalHours(sheetIds: string[]): number {
  const context = useContext(EntriesContext)
  if (!context) throw new Error('useAllSheetsTotalHours must be used within an EntriesProvider')
  return context.getTotalHoursForSheets(sheetIds)
}
