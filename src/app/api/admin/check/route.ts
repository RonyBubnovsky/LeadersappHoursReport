import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/services/admin'

export const dynamic = 'force-dynamic'

/**
 * Check if the current user is an admin.
 * Returns only { isAdmin: boolean } - never exposes admin ID or email.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }
    
    const adminStatus = isAdmin(user.id)
    
    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
