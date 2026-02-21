import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, acceptedTerms } = body

    // Server-side validation: terms must be accepted
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'יש לאשר את תנאי השימוש ומדיניות הפרטיות' },
        { status: 400 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'אימייל וסיסמה הם שדות חובה' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
        data: {
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // If identities array is empty, the user already exists
    if (data.user && data.user.identities?.length === 0) {
      return NextResponse.json(
        { error: 'user_already_exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ needsConfirmation: true })
  } catch {
    return NextResponse.json(
      { error: 'שגיאה בהרשמה. נסה שוב.' },
      { status: 500 }
    )
  }
}
