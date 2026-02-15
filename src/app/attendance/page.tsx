'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Plus, ExternalLink, Trash2, Link2, X, Pencil } from 'lucide-react'
import { useAuth, useAttendanceLinks } from '@/hooks'
import { NavBar } from '@/components/layout'
import { Button, Input, Card, CardContent, LoadingScreen, useConfirm } from '@/components/ui'

export default function AttendancePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { links, loading, error, addLink, updateLink, deleteLink, refetch } = useAttendanceLinks()
  const confirm = useConfirm()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch links once on mount (Context handles deduplication)
  useEffect(() => {
    if (user) {
      refetch()
    }
  }, [user, refetch])

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) return null

  const canSubmit = name.trim().length > 0 && url.trim().length > 0

  const openModal = (linkToEdit?: { id: string; name: string; url: string }) => {
    if (linkToEdit) {
      setEditingId(linkToEdit.id)
      setName(linkToEdit.name)
      setUrl(linkToEdit.url)
    } else {
      setEditingId(null)
      setName('')
      setUrl('')
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setName('')
    setUrl('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateLink(editingId, name.trim(), url.trim())
      } else {
        await addLink(name.trim(), url.trim())
      }
      closeModal()
    } catch {
      alert(editingId ? 'שגיאה בעדכון הקישור' : 'שגיאה בהוספת הקישור')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, linkName: string) => {
    const confirmed = await confirm({
      title: 'מחיקת קישור',
      message: `האם אתה בטוח שברצונך למחוק את "${linkName}"?`,
      confirmText: 'מחק',
      cancelText: 'ביטול',
      variant: 'danger',
    })
    if (confirmed) {
      try {
        await deleteLink(id)
      } catch {
        alert('שגיאה במחיקת הקישור')
      }
    }
  }

  const openLink = (linkUrl: string) => {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
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
                <div className="p-2 rounded-xl bg-teal-600">
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    נוכחות
                  </h1>
                  <p className="text-gray-500 text-xs md:text-sm hidden sm:block">
                    קישורים לדרייבים ואתרי נוכחות
                  </p>
                </div>
              </div>
              <Button onClick={() => openModal()} size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">הוסף נוכחות</span>
                <span className="sm:hidden">הוסף</span>
              </Button>
            </div>
          </header>

          {/* Content */}
          {error ? (
            <Card variant="bordered" className="text-center py-12">
              <CardContent>
                <p className="text-red-500">{error}</p>
                <Button onClick={() => refetch()} variant="secondary" className="mt-4">
                  נסה שוב
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card variant="bordered" className="text-center py-12">
              <CardContent>
                <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">טוען קישורים...</p>
              </CardContent>
            </Card>
          ) : links.length === 0 ? (
            <Card variant="bordered" className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-teal-50 mb-6">
                  <Link2 className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  אין קישורים שמורים
                </h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base mb-6">
                  הוסף קישורים לדרייבים ואתרי נוכחות כדי לגשת אליהם בקלות
                </p>
                <Button onClick={() => openModal()}>
                  <Plus className="w-4 h-4" />
                  הוסף נוכחות
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <Card key={link.id} variant="bordered" className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => openLink(link.url)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-right hover:text-teal-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors break-words text-right">
                          {link.name}
                        </span>
                      </button>
                      <div className="flex gap-1 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openModal(link)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(link.id, link.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Link Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 left-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                  <Link2 className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {editingId ? 'עריכת נוכחות' : 'הוסף נוכחות'}
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {editingId ? 'ערוך את השם או הקישור' : 'הזן שם וקישור לאתר או דרייב'}
              </p>

              <div className="space-y-3 mb-6">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם (למשל: נוכחות כיתה א׳)"
                  autoFocus
                />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="קישור (למשל: https://drive.google.com/...)"
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  className="flex-1"
                >
                  ביטול
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  {editingId ? 'שמור' : 'הוסף'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
