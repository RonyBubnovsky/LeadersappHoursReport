'use client'

import { useState, FormEvent, useCallback } from 'react'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/validation'
import { useAuth } from '@/hooks'

const ERROR_MAP: Record<string, string> = {
  invalid_credentials: 'אימייל או סיסמה שגויים',
  email_not_confirmed: 'נא לאשר את כתובת האימייל לפני ההתחברות',
  user_not_found: 'משתמש לא נמצא',
  too_many_requests: 'יותר מדי ניסיונות. נסה שוב מאוחר יותר',
}

function mapSupabaseError(errorMessage: string): string {
  const key = Object.keys(ERROR_MAP).find(k =>
    errorMessage.toLowerCase().includes(k.replace(/_/g, ' ')) ||
    errorMessage.toLowerCase().includes(k)
  )
  return key ? ERROR_MAP[key] : 'שגיאה בהתחברות. נסה שוב.'
}

export function EmailSignInForm() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const validate = useCallback((): boolean => {
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = 'שדה חובה'
    } else if (!validateEmail(email)) {
      errors.email = 'כתובת אימייל לא תקינה'
    }

    if (!password) {
      errors.password = 'שדה חובה'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [email, password])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setLoading(true)
    try {
      const result = await signInWithEmail(email, password)
      if (result.error) {
        setError(mapSupabaseError(result.error))
      }
    } catch {
      setError('שגיאה בהתחברות. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="signin-email"
        type="email"
        label="אימייל"
        placeholder="your@email.com"
        value={email}
        onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })) }}
        error={fieldErrors.email}
        autoComplete="email"
        dir="ltr"
      />

      <Input
        id="signin-password"
        type="password"
        label="סיסמה"
        placeholder="••••••••"
        value={password}
        onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })) }}
        error={fieldErrors.password}
        autoComplete="current-password"
        dir="ltr"
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <Button
        type="submit"
        isLoading={loading}
        size="lg"
        className="w-full"
      >
        התחבר
      </Button>
    </form>
  )
}
