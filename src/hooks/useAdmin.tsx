'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AdminUser {
  id: string
  email: string | undefined
  created_at: string
  last_sign_in_at: string | null
}

interface AdminContextType {
  isAdmin: boolean
  isChecking: boolean
  users: AdminUser[]
  isLoadingUsers: boolean
  checkAdminStatus: () => Promise<void>
  fetchUsers: () => Promise<void>
  deleteUser: (userId: string) => Promise<boolean>
  deleteAllUsers: () => Promise<{ deleted: number; failed: number } | null>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const checkAdminStatus = useCallback(async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAdmin(data.isAdmin === true)
    } catch {
      setIsAdmin(false)
    }
    setIsChecking(false)
  }, [])

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
    setIsLoadingUsers(false)
  }, [])

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  }, [])

  const deleteAllUsers = useCallback(async (): Promise<{ deleted: number; failed: number } | null> => {
    try {
      const response = await fetch('/api/admin/users/all', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        setUsers([])
        return result
      }
      return null
    } catch (error) {
      console.error('Failed to delete all users:', error)
      return null
    }
  }, [])

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      isChecking, 
      users, 
      isLoadingUsers,
      checkAdminStatus, 
      fetchUsers, 
      deleteUser,
      deleteAllUsers 
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
