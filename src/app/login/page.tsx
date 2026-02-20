'use client'

import { Suspense } from 'react'
import { LoadingScreen } from '@/components/ui'
import LoginPageContent from './LoginPageContent'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageContent />
    </Suspense>
  )
}
