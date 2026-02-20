export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, message: 'לפחות 8 תווים' },
  { test: (p: string) => /[a-z]/.test(p), message: 'לפחות אות קטנה אחת (a-z)' },
  { test: (p: string) => /[A-Z]/.test(p), message: 'לפחות אות גדולה אחת (A-Z)' },
  { test: (p: string) => /\d/.test(p), message: 'לפחות ספרה אחת (0-9)' },
  { test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p), message: 'לפחות תו מיוחד אחד (!@#$...)' },
] as const

export function validatePassword(password: string): PasswordValidationResult {
  const errors = PASSWORD_RULES
    .filter(rule => !rule.test(password))
    .map(rule => rule.message)

  return { valid: errors.length === 0, errors }
}

export function getPasswordRules(password: string) {
  return PASSWORD_RULES.map(rule => ({
    label: rule.message,
    met: rule.test(password),
  }))
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const PASSWORD_UPDATE_ERRORS: Record<string, string> = {
  same_password: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית.',
  weak_password: 'הסיסמה חלשה מדי. נסה סיסמה חזקה יותר.',
  reauthentication: 'מסיבות אבטחה, נא להתנתק ולהתחבר מחדש כדי לשנות סיסמה.',
  session_expired: 'פג תוקף הקישור. נא לבקש קישור איפוס חדש.',
}

export function mapPasswordUpdateError(errorCode: string | undefined, errorMessage: string): string {
  if (errorCode && errorCode in PASSWORD_UPDATE_ERRORS) {
    return PASSWORD_UPDATE_ERRORS[errorCode]
  }
  const msg = errorMessage.toLowerCase()
  const matchedKey = Object.keys(PASSWORD_UPDATE_ERRORS).find(key =>
    msg.includes(key.replace(/_/g, ' ')) || msg.includes(key)
  )
  if (matchedKey) return PASSWORD_UPDATE_ERRORS[matchedKey]
  if (msg.includes('session') || msg.includes('recently')) {
    return PASSWORD_UPDATE_ERRORS.reauthentication
  }
  return 'שגיאה בעדכון הסיסמה. נסה שוב.'
}
