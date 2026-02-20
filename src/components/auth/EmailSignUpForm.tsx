'use client'

import { useState, FormEvent, useCallback } from 'react'
import { Button, Input, PasswordInput } from '@/components/ui'
import { validateEmail, validatePassword, getPasswordRules } from '@/lib/validation'
import { useAuth } from '@/hooks'
import { CheckCircle, Circle, Mail } from 'lucide-react'

const ERROR_MAP: Record<string, string> = {
  user_already_exists: 'אימייל זה כבר רשום במערכת',
  email_already_in_use: 'אימייל זה כבר רשום במערכת',
  weak_password: 'הסיסמה חלשה מדי',
  too_many_requests: 'יותר מדי ניסיונות. נסה שוב מאוחר יותר',
  signup_disabled: 'הרשמה אינה זמינה כרגע',
}

function mapSupabaseError(errorMessage: string): string {
  const key = Object.keys(ERROR_MAP).find(k =>
    errorMessage.toLowerCase().includes(k.replace(/_/g, ' ')) ||
    errorMessage.toLowerCase().includes(k)
  )
  return key ? ERROR_MAP[key] : 'שגיאה בהרשמה. נסה שוב.'
}

function PasswordChecklist({ password }: { password: string }) {
  const rules = getPasswordRules(password)

  return (
    <ul className="space-y-1 mt-2" role="list">
      {rules.map(rule => (
        <li
          key={rule.label}
          className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
            rule.met ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {rule.met ? (
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  )
}

function ConfirmationMessage() {
  return (
    <div className="text-center space-y-4 py-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
        <Mail className="w-7 h-7 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">בדוק את תיבת הדואר שלך</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          שלחנו לך אימייל אישור. לחץ על הקישור באימייל כדי להפעיל את החשבון שלך.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          לא קיבלת? בדוק בתיקיית הספאם.
        </p>
      </div>
    </div>
  )
}

export function EmailSignUpForm() {
  const { signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})

  const validate = useCallback((): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {}

    if (!email.trim()) {
      errors.email = 'שדה חובה'
    } else if (!validateEmail(email)) {
      errors.email = 'כתובת אימייל לא תקינה'
    }

    const passwordValidation = validatePassword(password)
    if (!password) {
      errors.password = 'שדה חובה'
    } else if (!passwordValidation.valid) {
      errors.password = 'הסיסמה לא עומדת בכל הדרישות'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'שדה חובה'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [email, password, confirmPassword])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setLoading(true)
    try {
      const result = await signUpWithEmail(email, password)
      if (result.error) {
        setError(mapSupabaseError(result.error))
      } else if (result.needsConfirmation) {
        setSuccess(true)
      }
    } catch {
      setError('שגיאה בהרשמה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <ConfirmationMessage />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="signup-email"
        type="email"
        label="אימייל"
        placeholder="your@email.com"
        value={email}
        onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })) }}
        error={fieldErrors.email}
        autoComplete="email"
        dir="ltr"
      />

      <div>
        <PasswordInput
          id="signup-password"
          label="סיסמה"
          placeholder="••••••••"
          value={password}
          onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })) }}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        {password.length > 0 && <PasswordChecklist password={password} />}
      </div>

      <PasswordInput
        id="signup-confirm-password"
        label="אימות סיסמה"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({ ...prev, confirmPassword: undefined })) }}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
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
        הרשמה
      </Button>
    </form>
  )
}
