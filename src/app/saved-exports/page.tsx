'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Download, Trash2, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { useAuth, useSavedExports } from '@/hooks'
import { NavBar } from '@/components/layout'
import { Button, Card, CardContent, useConfirm, LoadingScreen } from '@/components/ui'
import type { SavedExport } from '@/types'

export default function SavedExportsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { exports, loading, error, downloadExport, deleteExport, refresh } = useSavedExports()
  const confirm = useConfirm()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) return null

  const handleDownload = async (exportItem: SavedExport) => {
    try {
      await downloadExport(exportItem)
    } catch {
      alert('שגיאה בהורדת הקובץ')
    }
  }

  const handleDelete = async (exportItem: SavedExport) => {
    const confirmed = await confirm({
      title: 'מחיקת קובץ',
      message: `האם אתה בטוח שברצונך למחוק את "${exportItem.file_name}"?`,
      confirmText: 'מחק',
      cancelText: 'ביטול',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteExport(exportItem.id, exportItem.file_path)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600">
                  <Archive className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    גיליונות שמורים
                  </h1>
                  <p className="text-gray-500 text-xs md:text-sm hidden sm:block">
                    קבצי האקסל שייצאת נשמרים כאן
                  </p>
                </div>
              </div>
              <Button onClick={refresh} variant="secondary" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">רענן</span>
              </Button>
            </div>
          </header>

          {/* Content */}
          {error ? (
            <Card variant="bordered" className="text-center py-12">
              <CardContent>
                <p className="text-red-500">{error}</p>
                <Button onClick={refresh} variant="secondary" className="mt-4">
                  נסה שוב
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card variant="bordered" className="text-center py-12">
              <CardContent>
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">טוען קבצים...</p>
              </CardContent>
            </Card>
          ) : exports.length === 0 ? (
            <Card variant="bordered" className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-purple-50 mb-6">
                  <FileSpreadsheet className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  אין קבצים שמורים
                </h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
                  כאשר תייצא דוח כללי, הוא יישמר כאן אוטומטית
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered">
              <CardContent className="p-0">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">שם הקובץ</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">תאריך</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">גיליונות</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">שעות</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">גודל</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {exports.map((exportItem) => (
                        <tr key={exportItem.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-green-600" />
                              <span className="text-gray-900 font-medium">{exportItem.file_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {formatDate(exportItem.created_at)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {exportItem.sheets_count}
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-medium text-sm">
                            {exportItem.total_hours.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-sm">
                            {formatFileSize(exportItem.file_size)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(exportItem)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(exportItem)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {exports.map((exportItem) => (
                    <div key={exportItem.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-900 font-medium truncate">
                            {exportItem.file_name}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(exportItem)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(exportItem)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>{formatDate(exportItem.created_at)}</span>
                        <span>{exportItem.sheets_count} גיליונות</span>
                        <span className="text-blue-600 font-medium">
                          {exportItem.total_hours.toFixed(2)} שעות
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
