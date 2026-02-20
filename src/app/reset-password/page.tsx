import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ResetPasswordClient from './ResetPasswordClient'

export default async function ResetPasswordPage() {
  const cookieStore = await cookies()
  const recoveryFlag = cookieStore.get('password_recovery')

  if (!recoveryFlag) {
    redirect('/login')
  }

  return <ResetPasswordClient />
}
