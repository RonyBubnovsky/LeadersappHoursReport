'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session only once
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // Handle case where user was deleted but session still exists
      if (error?.code === 'user_not_found') {
        await supabase.auth.signOut()
        setUser(null)
        setLoading(false)
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes (this must always run to catch signOut)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [supabase.auth])

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [supabase.auth])

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string; needsConfirmation?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    // If identities array is empty, the user already exists
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'user_already_exists' }
    }
    return { needsConfirmation: true }
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [supabase.auth])

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }), [user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook for accessing authentication state.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
