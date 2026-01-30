import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, deleteAllUsersExceptAdmin } from '@/services/admin'

export const dynamic = 'force-dynamic'

/**
 * Delete all users except admin (admin only).
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const result = await deleteAllUsersExceptAdmin()
    
    return NextResponse.json({ 
      success: true, 
      deleted: result.deleted,
      failed: result.failed 
    })
  } catch (error) {
    console.error('Error deleting all users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
