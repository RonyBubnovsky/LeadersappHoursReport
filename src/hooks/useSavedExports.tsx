'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { listExports, downloadExport as downloadExportFile, deleteExport as deleteExportFile } from '@/lib/supabase/storage'
import type { SavedExport } from '@/types'

interface SavedExportsContextType {
  exports: SavedExport[]
  loading: boolean
  error: string | null
  downloadExport: (exportItem: SavedExport) => Promise<void>
  deleteExport: (id: string, filePath: string) => Promise<boolean>
  refresh: () => Promise<void>
}

const SavedExportsContext = createContext<SavedExportsContextType | null>(null)

export function SavedExportsProvider({ children }: { children: ReactNode }) {
  const [exports, setExports] = useState<SavedExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listExports()
      setExports(data)
    } catch (err) {
      setError('שגיאה בטעינת הקבצים')
      console.error('Error fetching exports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExports()
  }, [fetchExports])

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
        setExports(prev => prev.filter(e => e.id !== id))
      }
      return success
    } catch (err) {
      console.error('Error deleting export:', err)
      return false
    }
  }, [])

  const value = useMemo(() => ({
    exports,
    loading,
    error,
    downloadExport,
    deleteExport,
    refresh: fetchExports
  }), [exports, loading, error, downloadExport, deleteExport, fetchExports])

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
