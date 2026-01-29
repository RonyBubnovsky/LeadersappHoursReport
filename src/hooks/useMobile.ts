'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export function useSidebarState() {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  const toggle = () => setIsOpen(prev => !prev)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isMobile,
    isOpen,
    toggle,
    open,
    close,
  }
}
