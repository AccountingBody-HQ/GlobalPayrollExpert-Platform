'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  countryCode: string
  countryName: string
  brackets: any[]
  ss: any[]
  rules: any[]
  currencyCode: string | null
}

interface VerificationResult {
  summary: string
  findings: {
    table: string
    field: string
    current_value: string
    found_value: string
    status: 'match' | 'mismatch' | 'unverified'
    source: string
    note: string
  }[]
}

export default function VerifyClient({ countryCode, countryName, brackets, ss, rules, currencyCode }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')

  async function runVerification() {
    setLoading(true)
    setError('')
    setResult(null)

    const prompt = `You are a payroll data verification expert. Verify the following data for ${countryName} (${countryCode}) against official government sources for tax year 2025.

CURRENT DATABASE VALUES:

TAX BRACKETS:
${brackets.map(b => `- ${b.bracket_name}: ${b.lower_limit} to ${b.upper_limit ?? 'unlimited'} at ${b.rate}% (source: ${b.source_url})`).join('\n')}

SOCIAL SECURITY:
${ss.map(r => `- ${r.contribution_type}: employer ${r.employer_rate}%, employee ${r.employee_rate}% (source: ${r.source_url})`).join('\n')}

EMPLOYMENT RULES:
${rules.map(r => `- ${r.rule_type}: ${r.value_text ?? r.value_numeric + ' ' + (r.value_unit ?? '')} (source: ${r.source_url})`).join('\n')}

Based on your knowledge of ${countryName} tax and employment law for 2025, verify each data point above.

Respond ONLY with a JSON object in this exact format, no other text:
{
  "summary": "Brief overall assessment",
  "findings": [
    {
      "table": "tax_brackets|social_security|employment_rules",
      "field": "name of the field or bracket",
      "current_value": "what is in our database",
      "found_value": "what you believe the correct value is",
      "status": "match|mismatch|unverified",
      "source": "official source URL",
      "note": "brief explanation"
    }
  ]
}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      const parsed = JSON.parse(jsonMatch[0])
      setResult(parsed)
    } catch (e: any) {
      setError('Verification failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const matches    = result?.findings.filter(f => f.status === 'match').length ?? 0
  const mismatches = result?.findings.filter(f => f.status === 'mismatch').length ?? 0
  const unverified = result?.findings.filter(f => f.status === 'unverified').length ?? 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold">AI Verification</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Claude will check all data points against official sources for {countryName}
          </p>
        </div>
        <button
          onClick={runVerification}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
            : <><Sparkles size={15} /> Run AI Verification</>
          }
        </button>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="px-6 py-12 text-center">
          <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Verifying {countryName} data...</p>
          <p className="text-slate-400 text-sm">Claude is checking against official government sources</p>
        </div>
      )}

      {result && !loading && (
        <div className="p-6">

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{matches}</p>
              <p className="text-emerald-400 text-xs font-bold mt-1">Confirmed Correct</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-red-400">{mismatches}</p>
              <p className="text-red-400 text-xs font-bold mt-1">Possible Issues</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-amber-400">{unverified}</p>
              <p className="text-amber-400 text-xs font-bold mt-1">Needs Manual Check</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Findings */}
          <div className="space-y-3">
            {result.findings.map((f, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 ${
                  f.status === 'match'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : f.status === 'mismatch'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {f.status === 'match'
                      ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      : f.status === 'mismatch'
                      ? <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      : <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{f.table}</span>
                        <span className="text-white font-semibold text-sm">{f.field}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Current in DB</p>
                          <p className="text-sm font-mono text-slate-300">{f.current_value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">AI Found</p>
                          <p className={`text-sm font-mono font-bold ${
                            f.status === 'match' ? 'text-emerald-400' :
                            f.status === 'mismatch' ? 'text-red-400' : 'text-amber-400'
                          }`}>{f.found_value}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{f.note}</p>
                      {f.source && (
                        <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block truncate max-w-xs">{f.source}</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-xs mt-6 text-center">
            AI verification is a guide only. Always confirm mismatches against official government sources before updating the database.
          </p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Click Run AI Verification to check all data points for {countryName}</p>
        </div>
      )}
    </div>
  )
}
