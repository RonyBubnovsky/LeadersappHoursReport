'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Card, CardContent, LoadingScreen } from '@/components/ui'
import {
  EmailSignInForm,
  EmailSignUpForm,
  ForgotPasswordForm,
  GoogleSignInButton,
  AuthTabSwitcher,
  LoginHeader,
} from '@/components/auth'
import type { AuthTab } from '@/components/auth'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function LoginPageContent() {
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
          <LoginHeader />

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
              <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={loading} />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-400">או</span>
                </div>
              </div>

              <AuthTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

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
