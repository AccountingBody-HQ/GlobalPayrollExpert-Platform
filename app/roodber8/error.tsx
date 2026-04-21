'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={28} style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {error.message || 'An unexpected error occurred in the admin panel.'}
          </p>
          {error.digest && (
            <p className="text-xs mt-2 font-mono" style={{ color: '#334155' }}>
              Digest: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#2563eb', color: '#ffffff' }}>
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  )
}