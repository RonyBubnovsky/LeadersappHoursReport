'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Archive, ClipboardList } from 'lucide-react'

const navItems = [
  { href: '/', label: 'בית', fullLabel: 'דף הבית', icon: Home },
  { href: '/schedule', label: 'מערכת', fullLabel: 'מערכת שעות', icon: Calendar },
  { href: '/saved-exports', label: 'שמורים', fullLabel: 'גיליונות שמורים', icon: Archive },
  { href: '/attendance', label: 'נוכחות', fullLabel: 'נוכחות', icon: ClipboardList },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center h-14 gap-2 sm:gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="sm:hidden">{item.label}</span>
                <span className="hidden sm:inline">{item.fullLabel}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
