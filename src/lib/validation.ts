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
