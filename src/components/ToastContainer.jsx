import React from 'react'

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 w-full max-w-[90vw] sm:max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto flex w-full items-center justify-between rounded-lg border-2 border-primary bg-popover px-4 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-4 fade-in duration-300 cursor-pointer hover:scale-[1.02] transition-transform ${
            toast.type === 'error' ? 'border-destructive' : ''
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="ml-4 text-xs font-bold opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
