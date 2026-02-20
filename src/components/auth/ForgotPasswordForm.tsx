'use client'

import { useState, FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/validation'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !validateEmail(email)) {
      setError('כתובת אימייל לא תקינה')
      return
    }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (resetError) {
        setError('שגיאה בשליחת הקישור. נסה שוב.')
      } else {
        setSent(true)
      }
    } catch {
      setError('שגיאה בשליחת הקישור. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">בדוק את תיבת הדואר שלך</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            אם קיים חשבון עם כתובת אימייל זו, נשלח אליו קישור לאיפוס סיסמה.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          חזרה להתחברות
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-gray-500 text-center">
        הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.
      </p>
      <Input
        id="reset-email"
        type="email"
        label="אימייל"
        placeholder="your@email.com"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(null) }}
        autoComplete="email"
        dir="ltr"
      />
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}
      <Button type="submit" isLoading={loading} size="lg" className="w-full">
        שלח קישור איפוס
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        חזרה להתחברות
      </button>
    </form>
  )
}
