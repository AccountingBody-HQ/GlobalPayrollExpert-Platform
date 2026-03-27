'use client'

import { useState } from 'react'
import Calculator from '@/components/Calculator'
import type { TaxBracket, SocialSecurityRate, CalculationResult } from '@/lib/calculator'

interface Props {
  countryCode: string
  countryName: string
  currencyCode: string
  taxBrackets: TaxBracket[]
  ssRates: SocialSecurityRate[]
  taxYear: number
  isAuthenticated: boolean
  initialSalary?: string
  initialPeriod?: 'monthly' | 'annual'
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'duplicate' | 'error'

export default function CalculatorWithSave({
  countryCode,
  countryName,
  currencyCode,
  taxBrackets,
  ssRates,
  taxYear,
  isAuthenticated,
  initialSalary,
  initialPeriod,
}: Props) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState<string>('')

  const handleSaveRequest = async (result: CalculationResult, gross: number, period: 'monthly' | 'annual') => {
    if (saveStatus === 'saving') return
    setSaveStatus('saving')
    setSaveMessage('')

    try {
      const res = await fetch('/api/save-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: countryCode,
          gross_salary: gross,
          period,
          label: `${countryName} — ${gross.toLocaleString()} ${currencyCode}`,
          calculation_result: result,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          setSaveStatus('error')
          setSaveMessage('Pro plan required. Upgrade to save calculations.')
          setTimeout(() => setSaveStatus('idle'), 5000)
          return
        }
        setSaveStatus('error')
        setSaveMessage(data.error || 'Failed to save. Please try again.')
        setTimeout(() => setSaveStatus('idle'), 4000)
        return
      }

      if (data.duplicate) {
        setSaveStatus('duplicate')
        setSaveMessage('This calculation is already in your dashboard.')
        setTimeout(() => setSaveStatus('idle'), 4000)
        return
      }

      setSaveStatus('saved')
      setSaveMessage('Saved successfully.')
      setTimeout(() => setSaveStatus('idle'), 4000)

    } catch {
      setSaveStatus('error')
      setSaveMessage('Network error. Please try again.')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
  }

  return (
    <div>
      {saveStatus === 'saved' && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm font-medium text-green-800 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
          {saveMessage} <a href="/dashboard/saved/" className="underline font-semibold ml-1">View in dashboard →</a>
        </div>
      )}
      {saveStatus === 'duplicate' && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-5 py-3 text-sm font-medium text-blue-800 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {saveMessage} <a href="/dashboard/saved/" className="underline font-semibold ml-1">View dashboard →</a>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm font-medium text-red-800 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {saveMessage}
          {saveMessage.includes('Pro plan') && (
            <a href="/pricing/" className="underline font-semibold ml-1 shrink-0">View Pro plans →</a>
          )}
        </div>
      )}
      <Calculator
        countryCode={countryCode}
        countryName={countryName}
        currencyCode={currencyCode}
        taxBrackets={taxBrackets}
        ssRates={ssRates}
        taxYear={taxYear}
        isAuthenticated={isAuthenticated}
        onSaveRequest={handleSaveRequest}
        initialSalary={initialSalary}
        initialPeriod={initialPeriod}
        saveStatus={saveStatus}
      />
    </div>
  )
}
