import { createAdminClient, getAdminUserId } from '@/lib/supabase/admin'

export interface AdminUser {
  id: string
  email: string | undefined
  created_at: string
  last_sign_in_at: string | null
}

/**
 * Check if a user ID is the admin user.
 * Comparison is done server-side only.
 */
export function isAdmin(userId: string): boolean {
  const adminId = getAdminUserId()
  return adminId !== null && userId === adminId
}

/**
 * Get all users from auth.users table.
 * Requires admin privileges.
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return data.users.map(user => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at ?? null,
  }))
}

/**
 * Delete all user data from application tables.
 */
export async function deleteUserData(userId: string): Promise<void> {
  const supabase = createAdminClient()
  
  // First, get all sheets for this user to delete their entries
  const { data: sheets } = await supabase
    .from('sheets')
    .select('id')
    .eq('user_id', userId)
  
  // Delete entries by sheet_id (entries don't have user_id directly)
  if (sheets && sheets.length > 0) {
    const sheetIds = sheets.map(s => s.id)
    const { error: entriesError } = await supabase
      .from('entries')
      .delete()
      .in('sheet_id', sheetIds)
    
    if (entriesError) {
      console.error('Error deleting entries:', entriesError)
    }
  }
  
  // Delete from tables that have user_id directly
  const tablesWithUserId = ['saved_exports', 'schedule_entries', 'sheets']
  
  for (const table of tablesWithUserId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error)
    }
  }
}

/**
 * Delete user files from storage.
 */
export async function deleteUserStorage(userId: string): Promise<void> {
  const supabase = createAdminClient()
  
  // List files in exports bucket for this user
  const { data: files, error: listError } = await supabase
    .storage
    .from('exports')
    .list(userId)
  
  if (listError) {
    console.error('Error listing storage files:', listError)
    return
  }
  
  if (files && files.length > 0) {
    const filePaths = files.map(file => `${userId}/${file.name}`)
    
    const { error: deleteError } = await supabase
      .storage
      .from('exports')
      .remove(filePaths)
    
    if (deleteError) {
      console.error('Error deleting storage files:', deleteError)
    }
  }
}

/**
 * Delete user from auth.users table.
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('Error deleting auth user:', error)
    throw error
  }
}

/**
 * Complete user deletion - removes all data and the user account.
 */
export async function deleteUserCompletely(userId: string): Promise<void> {
  // Don't allow deleting the admin user
  if (isAdmin(userId)) {
    throw new Error('Cannot delete admin user')
  }
  
  // Delete in order: data → storage → auth user
  await deleteUserData(userId)
  await deleteUserStorage(userId)
  await deleteAuthUser(userId)
}

/**
 * Delete all users except admin.
 */
export async function deleteAllUsersExceptAdmin(): Promise<{ deleted: number; failed: number }> {
  const users = await getAllUsers()
  const adminId = getAdminUserId()
  
  let deleted = 0
  let failed = 0
  
  for (const user of users) {
    if (user.id === adminId) continue
    
    try {
      await deleteUserCompletely(user.id)
      deleted++
    } catch (error) {
      console.error(`Failed to delete user ${user.id}:`, error)
      failed++
    }
  }
  
  return { deleted, failed }
}
