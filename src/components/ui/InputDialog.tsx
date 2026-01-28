'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface InputDialogOptions {
  title: string
  message: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

interface InputDialogContextType {
  prompt: (options: InputDialogOptions) => Promise<string | null>
}

const InputDialogContext = createContext<InputDialogContextType | null>(null)

export function InputDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<InputDialogOptions | null>(null)
  const [value, setValue] = useState('')
  const [resolvePromise, setResolvePromise] = useState<((value: string | null) => void) | null>(null)

  const prompt = useCallback((opts: InputDialogOptions): Promise<string | null> => {
    setOptions(opts)
    setValue(opts.defaultValue || '')
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolvePromise?.(value.trim() || null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolvePromise?.(null)
  }

  return (
    <InputDialogContext.Provider value={{ prompt }}>
      {children}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCancel}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCancel}
              className="absolute top-4 left-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FileText className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {options?.title}
              </h3>

              <p className="text-gray-500 text-center mb-4">
                {options?.message}
              </p>

              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={options?.placeholder}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                autoFocus
                className="mb-6"
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {options?.cancelText || 'ביטול'}
                </Button>
                <Button
                  variant="primary"
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
    </InputDialogContext.Provider>
  )
}

export function useInputDialog() {
  const context = useContext(InputDialogContext)
  if (!context) {
    throw new Error('useInputDialog must be used within an InputDialogProvider')
  }
  return context.prompt
}
