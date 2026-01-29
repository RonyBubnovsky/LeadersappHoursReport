'use client'

import { useState, useEffect, useRef } from 'react'

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
  // Track if user has interacted - prevents closing animation on initial load
  const hasInteracted = useRef(false)

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  const toggle = () => {
    hasInteracted.current = true
    setIsOpen(prev => !prev)
  }
  const open = () => {
    hasInteracted.current = true
    setIsOpen(true)
  }
  const close = () => {
    hasInteracted.current = true
    setIsOpen(false)
  }

  return {
    isMobile,
    isOpen,
    hasInteracted: hasInteracted.current,
    toggle,
    open,
    close,
  }
}
