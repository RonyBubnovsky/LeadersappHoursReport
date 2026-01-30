'use client'

import { useState } from 'react'
import { useAdmin } from '@/hooks'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { UserRow } from './UserRow'

export function UserList() {
  const { users, isLoadingUsers, deleteUser } = useAdmin()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const confirm = useConfirm()

  const handleDelete = async (userId: string, email: string | undefined) => {
    const confirmed = await confirm({
      title: 'הסרת משתמש',
      message: `האם אתה בטוח שברצונך להסיר את המשתמש ${email || userId}? פעולה זו תמחק את כל הנתונים שלו ולא ניתנת לביטול.`,
      confirmText: 'הסר משתמש',
      cancelText: 'ביטול',
      variant: 'danger',
    })

    if (confirmed) {
      setDeletingId(userId)
      await deleteUser(userId)
      setDeletingId(null)
    }
  }

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">טוען משתמשים...</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        אין משתמשים נוספים במערכת
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              מייל
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
              נוצר
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
              כניסה אחרונה
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <UserRow
              key={user.id}
              id={user.id}
              email={user.email}
              createdAt={user.created_at}
              lastSignIn={user.last_sign_in_at}
              onDelete={() => handleDelete(user.id, user.email)}
              isDeleting={deletingId === user.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
