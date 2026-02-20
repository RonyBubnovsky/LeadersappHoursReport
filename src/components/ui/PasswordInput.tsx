'use client'
import { useState, InputHTMLAttributes, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={cn(
              'w-full px-4 py-2.5 pe-10 bg-white border border-gray-300 rounded-lg',
              'text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(prev => !prev)}
            tabIndex={-1}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
          >
            {visible ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
