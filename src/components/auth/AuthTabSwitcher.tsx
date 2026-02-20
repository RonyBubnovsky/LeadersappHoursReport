'use client'

export type AuthTab = 'signin' | 'signup' | 'forgot'

interface AuthTabSwitcherProps {
  activeTab: AuthTab
  onTabChange: (tab: AuthTab) => void
}

export function AuthTabSwitcher({ activeTab, onTabChange }: AuthTabSwitcherProps) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          activeTab === 'signin'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        התחברות
      </button>
      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          activeTab === 'signup'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        הרשמה
      </button>
    </div>
  )
}
