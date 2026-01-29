'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react'
import { listExports, downloadExport as downloadExportFile, deleteExport as deleteExportFile } from '@/lib/supabase/storage'
import type { SavedExport } from '@/types'

const ITEMS_PER_PAGE = 5

interface SavedExportsContextType {
  exports: SavedExport[]
  loading: boolean
  error: string | null
  // Pagination
  currentPage: number
  totalPages: number
  paginatedExports: SavedExport[]
  setCurrentPage: (page: number) => void
  // Actions
  addExport: (newExport: SavedExport) => void
  downloadExport: (exportItem: SavedExport) => Promise<void>
  deleteExport: (id: string, filePath: string) => Promise<boolean>
  refresh: () => Promise<void>
  fetchExports: () => Promise<void>
}

const SavedExportsContext = createContext<SavedExportsContextType | null>(null)

export function SavedExportsProvider({ children }: { children: ReactNode }) {
  const [exports, setExports] = useState<SavedExport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const hasFetched = useRef(false)

  // Fetch exports only once on first access
  const fetchExports = useCallback(async () => {
    if (hasFetched.current) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await listExports()
      setExports(data)
      hasFetched.current = true
    } catch (err) {
      setError('שגיאה בטעינת הקבצים')
      console.error('Error fetching exports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Force refresh (for manual refresh button)
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listExports()
      setExports(data)
      hasFetched.current = true
    } catch (err) {
      setError('שגיאה בטעינת הקבצים')
      console.error('Error fetching exports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new export to context immediately (for optimistic UI)
  const addExport = useCallback((newExport: SavedExport) => {
    setExports(prev => [newExport, ...prev])
    // Reset to first page to show the new export
    setCurrentPage(1)
  }, [])

  const downloadExport = useCallback(async (exportItem: SavedExport) => {
    try {
      await downloadExportFile(exportItem.file_path, exportItem.file_name)
    } catch (err) {
      console.error('Error downloading export:', err)
      throw err
    }
  }, [])

  const deleteExport = useCallback(async (id: string, filePath: string) => {
    try {
      const success = await deleteExportFile(id, filePath)
      if (success) {
        setExports(prev => {
          const newExports = prev.filter(e => e.id !== id)
          // Adjust current page if needed after deletion
          const newTotalPages = Math.ceil(newExports.length / ITEMS_PER_PAGE)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }
          return newExports
        })
      }
      return success
    } catch (err) {
      console.error('Error deleting export:', err)
      return false
    }
  }, [currentPage])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(exports.length / ITEMS_PER_PAGE))
  
  const paginatedExports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return exports.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [exports, currentPage])

  const value = useMemo(() => ({
    exports,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedExports,
    setCurrentPage,
    addExport,
    downloadExport,
    deleteExport,
    refresh,
    fetchExports
  }), [exports, loading, error, currentPage, totalPages, paginatedExports, addExport, downloadExport, deleteExport, refresh, fetchExports])

  return (
    <SavedExportsContext.Provider value={value}>
      {children}
    </SavedExportsContext.Provider>
  )
}

/**
 * Hook for accessing saved exports.
 * Must be used within a SavedExportsProvider.
 */
export function useSavedExports() {
  const context = useContext(SavedExportsContext)
  if (!context) {
    throw new Error('useSavedExports must be used within a SavedExportsProvider')
  }
  return context
}

/**
 * Hook to fetch exports on component mount.
 * Call this in components that need to display exports.
 */
export function useFetchExportsOnMount() {
  const context = useContext(SavedExportsContext)
  if (!context) {
    throw new Error('useFetchExportsOnMount must be used within a SavedExportsProvider')
  }
  
  const { fetchExports } = context
  
  useEffect(() => {
    // fetchExports checks hasFetched internally, so it only fetches once
    fetchExports()
  }, [fetchExports])
}
