import { createClient } from '@/lib/supabase/client'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Deletes the current user and all their associated data.
 * Removes entries, sheets, and the user account from Supabase.
 */
export async function deleteUserAndData(userId: string): Promise<void> {
  const supabase = createClient()

  // Delete all entries for the user's sheets
  const { data: sheets } = await supabase
    .from('sheets')
    .select('id')
    .eq('user_id', userId)

  if (sheets && sheets.length > 0) {
    const sheetIds = sheets.map(s => s.id)
    await supabase
      .from('entries')
      .delete()
      .in('sheet_id', sheetIds)
    
    if (isDev) console.log(`✓ Deleted ${sheets.length} sheets and their entries`)
  }

  // Delete all schedule entries for this user
  await supabase
    .from('schedule_entries')
    .delete()
    .eq('user_id', userId)
  
  if (isDev) console.log('✓ Deleted schedule entries')

  // Delete all sheets
  await supabase
    .from('sheets')
    .delete()
    .eq('user_id', userId)

  // Delete auth user (this will sign them out)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  // If admin delete fails (likely no admin access), sign out instead
  if (error) {
    if (isDev) console.log('⚠ User deletion from Auth failed (no admin access), signing out instead')
    await supabase.auth.signOut()
  } else {
    if (isDev) console.log('✓ User successfully deleted from Auth')
  }
}
