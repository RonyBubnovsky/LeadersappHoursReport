'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Button, Card, CardContent, LoadingScreen } from '@/components/ui'
import { EmailSignInForm, EmailSignUpForm, ForgotPasswordForm } from '@/components/auth'
import { Clock } from 'lucide-react'

type AuthTab = 'signin' | 'signup' | 'forgot'

/**
 * Map URL error indicators to user-friendly Hebrew messages.
 * Handles both the query-param errors set by our callback route
 * (`?error=auth|confirmation`) and the hash-fragment errors that
 * Supabase appends directly (`#error_code=otp_expired`).
 */
function getAuthErrorMessage(
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

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AuthTab>('signin')

  // Pick up error indicators from the URL (query params + hash fragment)
  useEffect(() => {
    const errorParam = searchParams.get('error')

    // Supabase appends error details in the hash fragment, e.g.
    // #error=access_denied&error_code=otp_expired&error_description=...
    const hash = window.location.hash.substring(1) // strip leading '#'
    const hashParams = new URLSearchParams(hash)
    const hashErrorCode = hashParams.get('error_code')

    const message = getAuthErrorMessage(errorParam, hashErrorCode)
    if (message) {
      setError(message)
      // Clean the URL so a refresh doesn't re-show the error
      router.replace('/login', { scroll: false })
    }
  }, [searchParams, router])

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/')
    }
  }, [user, authLoading, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('שגיאה בהתחברות. נסה שוב.')
      setLoading(false)
    }
  }

  // Show loading while checking auth status
  if (authLoading || user) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card variant="bordered" className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">דיווח שעות LeadersApp</h1>
              <p className="text-gray-500 mt-2">התחבר כדי לנהל את שעות העבודה שלך</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {activeTab === 'forgot' ? (
            <ForgotPasswordForm onBack={() => setActiveTab('signin')} />
          ) : (
            <>
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                isLoading={loading}
                size="lg"
                className="w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                התחבר עם Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-400">או</span>
                </div>
              </div>

              {/* Sign In / Sign Up Tabs */}
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'signin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  התחברות
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'signup'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  הרשמה
                </button>
              </div>

              {/* Email Auth Forms */}
              {activeTab === 'signin' ? (
                <EmailSignInForm onForgotPassword={() => setActiveTab('forgot')} />
              ) : (
                <EmailSignUpForm />
              )}
            </>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-gray-400">
            הנתונים שלך מאובטחים ונשמרים בענן
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageContent />
    </Suspense>
  )
}
