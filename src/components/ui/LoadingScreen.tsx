'use client'

import { Clock } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

/**
 * Full-screen loading component with animated clock icon.
 * Used for auth loading states and page transitions.
 */
export function LoadingScreen({ message = 'טוען...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 animate-pulse">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  )
}
