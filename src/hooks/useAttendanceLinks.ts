'use client'

import { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode, createElement } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AttendanceLink } from '@/types'

interface AttendanceLinksContextType {
  links: AttendanceLink[]
  loading: boolean
  error: string | null
  addLink: (name: string, url: string) => Promise<void>
  updateLink: (id: string, name: string, url: string) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const AttendanceLinksContext = createContext<AttendanceLinksContextType | null>(null)

export function AttendanceLinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<AttendanceLink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const isFetchingRef = useRef(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchLinks = useCallback(async (force = false) => {
    if ((hasFetchedRef.current && !force) || isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('attendance_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLinks(data || [])
      hasFetchedRef.current = true
    }
    setLoading(false)
    isFetchingRef.current = false
  }, [supabase])

  const addLink = async (name: string, url: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('attendance_links')
      .insert({ user_id: user.id, name, url })
      .select()
      .single()

    if (error) throw error
    setLinks(prev => [data, ...prev])
  }

  const updateLink = async (id: string, name: string, url: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('attendance_links')
      .update({ name, url })
      .eq('id', id)

    if (error) throw error
    setLinks(prev => prev.map(l => l.id === id ? { ...l, name, url } : l))
  }

  const deleteLink = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('attendance_links')
      .delete()
      .eq('id', id)

    if (error) throw error
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  return createElement(
    AttendanceLinksContext.Provider,
    { value: { links, loading, error, addLink, updateLink, deleteLink, refetch: fetchLinks } },
    children
  )
}

export function useAttendanceLinks() {
  const context = useContext(AttendanceLinksContext)
  if (!context) {
    throw new Error('useAttendanceLinks must be used within an AttendanceLinksProvider')
  }
  return context
}
