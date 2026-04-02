"use client"
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function UnsubscribeClient() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle')
  const [message, setMessage] = useState('')

  async function handleUnsubscribe() {
    if (!email) {
      setStatus('error')
      setMessage('No email address provided. Please use the unsubscribe link from your email.')
      return
    }
    setStatus('loading')

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      } else if (data.already) {
        setStatus('already')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10 justify-center">
        <Globe className="h-5 w-5 text-blue-400" />
        <span className="text-base font-bold text-white tracking-tight">HRLake</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

        {status === 'idle' && (
          <>
            <h1 className="text-white font-bold text-2xl mb-3">Unsubscribe</h1>
            {email ? (
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                You are about to unsubscribe <span className="text-white font-medium">{email}</span> from HRLake monthly updates.
              </p>
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Please use the unsubscribe link from your email.
              </p>
            )}
            <button
              onClick={handleUnsubscribe}
              disabled={!email}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors text-sm mb-4"
            >
              Yes, unsubscribe me
            </button>
            <Link href="/"
              className="block text-slate-500 hover:text-slate-300 text-sm transition-colors">
              No, keep me subscribed
            </Link>
          </>
        )}

        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={40} />
            <p className="text-slate-400 text-sm">Processing your request...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="text-white font-bold text-xl mb-3">You are unsubscribed.</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              <span className="text-white font-medium">{email}</span> has been removed from all HRLake email updates. You will not receive any further emails from us.
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Return to HRLake
            </Link>
          </>
        )}

        {status === 'already' && (
          <>
            <CheckCircle className="text-slate-500 mx-auto mb-4" size={48} />
            <h2 className="text-white font-bold text-xl mb-3">Already unsubscribed.</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              <span className="text-white font-medium">{email}</span> is not currently subscribed to HRLake updates.
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Return to HRLake
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-white font-bold text-xl mb-3">Something went wrong.</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Try again
            </button>
          </>
        )}
      </div>

      <p className="text-slate-400 text-xs text-center mt-6">
        HRLake.com · Global HR, EOR and Payroll Intelligence
      </p>
    </div>
  )
}
