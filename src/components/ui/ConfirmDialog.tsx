'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolvePromise?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolvePromise?.(false)
  }

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'danger' as const,
    },
    warning: {
      icon: 'bg-yellow-100 text-yellow-600',
      button: 'primary' as const,
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'primary' as const,
    },
  }

  const currentVariant = options?.variant || 'danger'
  const styles = variantStyles[currentVariant]

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          
          {/* Dialog */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 left-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${styles.icon}`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {options?.title}
              </h3>

              {/* Message */}
              <p className="text-gray-500 text-center mb-6">
                {options?.message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {options?.cancelText || 'ביטול'}
                </Button>
                <Button
                  variant={styles.button}
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  {options?.confirmText || 'אישור'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}
