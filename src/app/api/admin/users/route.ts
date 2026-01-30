import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getAllUsers, deleteUserCompletely } from '@/services/admin'

export const dynamic = 'force-dynamic'

/**
 * Get all users (admin only).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const users = await getAllUsers()
    
    // Filter out admin from the list (admin should not delete themselves)
    const nonAdminUsers = users.filter(u => !isAdmin(u.id))
    
    return NextResponse.json({ users: nonAdminUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Delete a single user (admin only).
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // Prevent deleting admin
    if (isAdmin(userId)) {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 })
    }
    
    await deleteUserCompletely(userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
