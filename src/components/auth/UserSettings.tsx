'use client'

import { useState, FormEvent, useCallback } from 'react'
import { ChevronDown, Settings, CheckCircle, Circle } from 'lucide-react'
import { Button, PasswordInput } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { validatePassword, getPasswordRules, mapPasswordUpdateError } from '@/lib/validation'
import type { User } from '@supabase/supabase-js'

interface UserSettingsProps {
  user: User
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
          {rule.met ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  )
}

function ChangePasswordForm() {
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
        setSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setError('שגיאה בעדכון הסיסמה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs text-center">
        הסיסמה עודכנה בהצלחה!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <PasswordInput
          id="new-password"
          placeholder="סיסמה חדשה"
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); setError(null) }}
          autoComplete="new-password"
        />
        {newPassword.length > 0 && <PasswordChecklist password={newPassword} />}
      </div>
      <PasswordInput
        id="confirm-new-password"
        placeholder="אימות סיסמה חדשה"
        value={confirmPassword}
        onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
        autoComplete="new-password"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" size="sm" isLoading={loading} className="w-full">
        עדכן סיסמה
      </Button>
    </form>
  )
}

export function UserSettings({ user }: UserSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEmailUser = user.app_metadata?.provider === 'email'
  const displayName = user.user_metadata?.full_name || user.email

  return (
    <div className="flex-1 min-w-0">
      <button
        type="button"
        onClick={() => isEmailUser && setIsOpen(prev => !prev)}
        className={`flex items-center gap-1 w-full text-sm text-gray-700 truncate ${
          isEmailUser ? 'cursor-pointer hover:text-blue-600 transition-colors' : 'cursor-default'
        }`}
        title={isEmailUser ? 'הגדרות חשבון' : undefined}
      >
        <span className="truncate">{displayName}</span>
        {isEmailUser && (
          <>
            <Settings className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isEmailUser && isOpen && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">שינוי סיסמה</h4>
          <ChangePasswordForm />
        </div>
      )}
    </div>
  )
}

