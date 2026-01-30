'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface UserRowProps {
  id: string
  email: string | undefined
  createdAt: string
  lastSignIn: string | null
  onDelete: () => Promise<void>
  isDeleting: boolean
}

export function UserRow({ id, email, createdAt, lastSignIn, onDelete, isDeleting }: UserRowProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'לא ידוע'
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {email || 'אין מייל'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
        {formatDate(createdAt)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
        {formatDate(lastSignIn)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-400 hidden xl:table-cell">
        <span className="font-mono text-xs">{id.slice(0, 8)}...</span>
      </td>
      <td className="px-4 py-3 text-left">
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          isLoading={isDeleting}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">הסר</span>
        </Button>
      </td>
    </tr>
  )
}
