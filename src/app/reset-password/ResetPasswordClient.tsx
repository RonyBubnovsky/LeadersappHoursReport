'use client'

import { useState, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, PasswordInput } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { validatePassword, getPasswordRules, mapPasswordUpdateError } from '@/lib/validation'
import { Clock, CheckCircle, Circle } from 'lucide-react'

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
          {rule.met ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ResetPasswordClient() {
  const router = useRouter()
  const supabase = createClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validate = useCallback((): string | null => {
    const result = validatePassword(newPassword)
    if (!result.valid) return 'הסיסמה לא עומדת בכל הדרישות'
    if (newPassword !== confirmPassword) return 'הסיסמאות אינן תואמות'
    return null
  }, [newPassword, confirmPassword])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setError(mapPasswordUpdateError(updateError.code, updateError.message))
      } else {
        // Clear the recovery cookie now that the password has been updated
        await fetch('/api/auth/clear-recovery', { method: 'POST' })
        setSuccess(true)
      }
    } catch {
      setError('שגיאה בעדכון הסיסמה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="bordered" className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">הסיסמה עודכנה בהצלחה!</h2>
            <p className="text-sm text-gray-500">כעת תוכל להתחבר עם הסיסמה החדשה.</p>
            <Button onClick={() => router.push('/')} size="lg" className="w-full">
              המשך
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card variant="bordered" className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">איפוס סיסמה</h1>
              <p className="text-gray-500 mt-2">הזן סיסמה חדשה לחשבון שלך</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <PasswordInput
                id="reset-new-password"
                label="סיסמה חדשה"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(null) }}
                autoComplete="new-password"
              />
              {newPassword.length > 0 && <PasswordChecklist password={newPassword} />}
            </div>

            <PasswordInput
              id="reset-confirm-password"
              label="אימות סיסמה חדשה"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              עדכן סיסמה
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
