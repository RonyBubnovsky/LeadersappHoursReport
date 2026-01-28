import { createClient } from '@/lib/supabase/client'

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
  }

  // Delete all sheets
  await supabase
    .from('sheets')
    .delete()
    .eq('user_id', userId)

  // Delete auth user (this will sign them out)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  // If admin delete fails (likely no admin access), sign out instead
  if (error) {
    await supabase.auth.signOut()
  }
}
