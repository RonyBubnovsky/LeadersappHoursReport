/**
 * Map URL error indicators to user-friendly Hebrew messages.
 * Handles both the query-param errors set by our callback route
 * (`?error=auth|confirmation`) and the hash-fragment errors that
 * Supabase appends directly (`#error_code=otp_expired`).
 */
export function getAuthErrorMessage(
  errorParam: string | null,
  hashErrorCode: string | null,
): string | null {
  // Hash fragment error codes from Supabase take priority because they are
  // more specific (e.g. otp_expired, access_denied).
  if (hashErrorCode) {
    switch (hashErrorCode) {
      case 'otp_expired':
        return 'קישור האימות פג תוקף. נסה לשלוח קישור חדש.'
      case 'access_denied':
        return 'הגישה נדחתה. הקישור אינו תקף או שכבר נעשה בו שימוש.'
      default:
        return 'אירעה שגיאה באימות. נסה שוב.'
    }
  }

  if (errorParam) {
    switch (errorParam) {
      case 'auth':
        return 'אירעה שגיאה באימות. נסה שוב.'
      case 'confirmation':
        return 'אימות האימייל נכשל. נסה לשלוח קישור חדש.'
      default:
        return 'אירעה שגיאה. נסה שוב.'
    }
  }

  return null
}
