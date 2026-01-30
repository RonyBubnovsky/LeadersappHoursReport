'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useAdmin } from '@/hooks'

export function AdminActions() {
  const { users, deleteAllUsers, fetchUsers } = useAdmin()
  const [isDeleting, setIsDeleting] = useState(false)
  const confirm = useConfirm()

  const handleDeleteAll = async () => {
    if (users.length === 0) return

    const confirmed = await confirm({
      title: 'מחיקת כל המשתמשים',
      message: `האם אתה בטוח שברצונך למחוק את כל ${users.length} המשתמשים? פעולה זו תמחק את כל הנתונים שלהם ולא ניתנת לביטול.`,
      confirmText: 'מחק את כולם',
      cancelText: 'ביטול',
      variant: 'danger',
    })

    if (confirmed) {
      setIsDeleting(true)
      const result = await deleteAllUsers()
      setIsDeleting(false)
      
      if (result) {
        await fetchUsers()
      }
    }
  }

  if (users.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant="danger"
        size="sm"
        onClick={handleDeleteAll}
        isLoading={isDeleting}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        <span>מחק את כל המשתמשים ({users.length})</span>
      </Button>
    </div>
  )
}
