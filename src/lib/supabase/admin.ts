import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with admin privileges using the secret key.
 * IMPORTANT: Only use in API routes (server-side) - NEVER import in client code!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing Supabase admin credentials in environment variables')
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Gets the admin user ID from environment.
 * Returns null if not configured.
 */
export function getAdminUserId(): string | null {
  return process.env.ADMIN_USER_ID || null
}
