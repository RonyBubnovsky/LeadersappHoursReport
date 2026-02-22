import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // Handle email confirmation links (token_hash + type)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      // Recovery links: set a short-lived HTTP-only cookie so the
      // /reset-password server component can verify this is legitimate.
      if (type === 'recovery') {
        const response = NextResponse.redirect(`${origin}/reset-password`)
        response.cookies.set('password_recovery', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 300, // 5 minutes
          path: '/',
        })
        return response
      }
      // Signup verification: signal the dashboard to show a success toast
      const redirectUrl = new URL(next, origin)
      redirectUrl.searchParams.set('verified', 'true')
      return NextResponse.redirect(redirectUrl.toString())
    }
    return NextResponse.redirect(`${origin}/login?error=confirmation`)
  }

  // Handle PKCE code exchange (OAuth + password recovery)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password recovery via PKCE: Supabase doesn't forward `type` in the
      // redirect, so we detect recovery by the `next` param we set in
      // ForgotPasswordForm's redirectTo URL.
      if (next === '/reset-password') {
        const response = NextResponse.redirect(`${origin}/reset-password`)
        response.cookies.set('password_recovery', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 300, // 5 minutes
          path: '/',
        })
        return response
      }
      // Email provider verification: show success toast
      const provider = data.user?.app_metadata?.provider
      if (provider === 'email') {
        const redirectUrl = new URL(next, origin)
        redirectUrl.searchParams.set('verified', 'true')
        return NextResponse.redirect(redirectUrl.toString())
      }
      // OAuth login (e.g. Google): just redirect without verified flag
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
