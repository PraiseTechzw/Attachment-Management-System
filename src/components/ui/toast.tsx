'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}

let toastQueue: Toast[] = []
let setToasts: ((toasts: Toast[]) => void) | null = null

export function showToast(type: 'success' | 'error' | 'warning', message: string) {
  const toast: Toast = {
    id: Date.now().toString(),
    type,
    message
  }
  
  toastQueue.push(toast)
  if (setToasts) {
    setToasts([...toastQueue])
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id)
    if (setToasts) {
      setToasts([...toastQueue])
    }
  }, 5000)
}

export function ToastContainer() {
  const [toasts, setToastsState] = useState<Toast[]>([])
  
  useEffect(() => {
    setToasts = setToastsState
    return () => {
      setToasts = null
    }
  }, [])
  
  const removeToast = (id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    setToastsState([...toastQueue])
  }
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />
      default: return null
    }
  }
  
  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
      default: return 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
    }
  }
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getBgColor(toast.type)} animate-in slide-in-from-right-full`}
        >
          {getIcon(toast.type)}
          <p className="text-sm font-medium text-slate-900 dark:text-white flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}