'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

interface Props {
  countryCode: string
  countryName: string
  brackets: any[]
  ss: any[]
  rules: any[]
  currencyCode: string | null
}

interface Finding {
  table: string
  record_id: string
  field: string
  current_value: string
  found_value: string
  raw_value: string | number | null
  status: 'match' | 'mismatch' | 'unverified'
  source: string
  note: string
}

interface VerificationResult {
  summary: string
  findings: Finding[]
}

export default function VerifyClient({ countryCode, countryName, brackets, ss, rules, currencyCode }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'rejected' | 'saving' | 'saved'>>({})
  const [saved, setSaved] = useState(false)
  const [allSaved, setAllSaved] = useState(false)

  async function runVerification() {
    setLoading(true)
    setError('')
    setResult(null)
    setDecisions({})
    setSaved(false)
    setAllSaved(false)

    const prompt = `You are a payroll data verification expert. Use web search to verify the following data for ${countryName} (${countryCode}) against official government sources for tax year 2025.

Search official government websites before responding.

CURRENT DATABASE VALUES (record_id included for each):

TAX BRACKETS:
${brackets.map(b => `- record_id: ${b.id} | ${b.bracket_name}: lower_limit=${b.lower_limit}, upper_limit=${b.upper_limit ?? 'null'}, rate=${b.rate} | source: ${b.source_url}`).join('\n')}

SOCIAL SECURITY:
${ss.map(r => `- record_id: ${r.id} | ${r.contribution_type}: employer_rate=${r.employer_rate}, employee_rate=${r.employee_rate}, applies_above=${r.applies_above}, applies_below=${r.applies_below} | source: ${r.source_url}`).join('\n')}

EMPLOYMENT RULES:
${rules.map(r => `- record_id: ${r.id} | ${r.rule_type}: value_text=${r.value_text ?? 'null'}, value_numeric=${r.value_numeric ?? 'null'}, value_unit=${r.value_unit ?? 'null'} | source: ${r.source_url}`).join('\n')}

After searching official sources, verify each data point. For any mismatch, include the exact field name that needs updating and the exact new value.

Respond ONLY with raw JSON, no markdown, no code blocks:
{
  "summary": "What you searched and found overall",
  "findings": [
    {
      "table": "tax_brackets|social_security|employment_rules",
      "record_id": "exact uuid from the data above",
      "field": "exact database column name to update e.g. lower_limit, upper_limit, rate, employer_rate, employee_rate, value_numeric, value_text",
      "current_value": "human readable current value",
      "found_value": "human readable value from official source",
      "raw_value": "the exact new value to write to database (number or string, no units)",
      "status": "match|mismatch|unverified",
      "source": "official government URL",
      "note": "brief explanation"
    }
  ]
}`

    try {
      const response = await fetch('/api/verify-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (data.error) throw new Error('API error: ' + data.error)
      if (!data.content || !data.content[0]) throw new Error('Empty response from API')

      const text = data.content[0].text ?? ''
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      if (start === -1 || end === -1) throw new Error('No JSON in response')
      const parsed = JSON.parse(cleaned.slice(start, end + 1))
      setResult(parsed)
    } catch (e: any) {
      setError('Verification failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function approve(index: number, finding: Finding) {
    // For matches — just mark as approved, no DB update needed
    if (finding.status === 'match') {
      setDecisions(prev => ({ ...prev, [index]: 'approved' }))
      return
    }

    // For mismatches — update the database automatically
    setDecisions(prev => ({ ...prev, [index]: 'saving' }))
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          action: 'update_value',
          finding: {
            table: finding.table,
            field: finding.field,
            new_value: finding.raw_value,
            record_id: finding.record_id,
          }
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDecisions(prev => ({ ...prev, [index]: 'saved' }))
    } catch (e: any) {
      setError('Update failed: ' + e.message)
      setDecisions(prev => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    }
  }

  function reject(index: number) {
    setDecisions(prev => ({ ...prev, [index]: 'rejected' }))
  }

  async function markVerified() {
    try {
      await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'approve_all' }),
      })
      setAllSaved(true)
    } catch (e: any) {
      setError('Save failed: ' + e.message)
    }
  }

  const matches    = result?.findings.filter(f => f.status === 'match').length ?? 0
  const mismatches = result?.findings.filter(f => f.status === 'mismatch').length ?? 0
  const unverified = result?.findings.filter(f => f.status === 'unverified').length ?? 0
  const totalFindings = result?.findings.length ?? 0
  const totalDecided = Object.keys(decisions).length
  const allDecided = totalFindings > 0 && totalDecided === totalFindings

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold">AI Verification</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Claude searches official government sources and auto-updates Supabase on approval
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
          <p className="text-white font-semibold mb-1">Searching official sources for {countryName}...</p>
          <p className="text-slate-400 text-sm">Claude is browsing government websites and verifying each data point</p>
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
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary.replace(/<[^>]*>/g, "")}</p>
          </div>

          {/* Findings */}
          <div className="space-y-3 mb-6">
            {result.findings.map((f, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 transition-all ${
                  decisions[i] === 'saved'
                    ? 'bg-emerald-500/5 border-emerald-500/40'
                    : decisions[i] === 'rejected'
                    ? 'bg-slate-800 border-slate-600 opacity-50'
                    : decisions[i] === 'approved'
                    ? 'bg-emerald-500/5 border-emerald-500/40'
                    : f.status === 'match'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : f.status === 'mismatch'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {decisions[i] === 'saved' || decisions[i] === 'approved'
                      ? <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      : decisions[i] === 'rejected'
                      ? <XCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                      : decisions[i] === 'saving'
                      ? <Loader2 size={16} className="text-blue-400 shrink-0 mt-0.5 animate-spin" />
                      : f.status === 'match'
                      ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      : f.status === 'mismatch'
                      ? <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      : <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{f.table}</span>
                        <span className="text-white font-semibold text-sm">{f.field}</span>
                        {f.status === 'mismatch' && !decisions[i] && (
                          <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded-full">
                            Approve will auto-update Supabase
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Current in DB</p>
                          <p className="text-sm font-mono text-slate-300">{f.current_value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">AI Found</p>
                          <p className={`text-sm font-mono font-bold ${
                            decisions[i] === 'saved' || decisions[i] === 'approved' ? 'text-emerald-400' :
                            f.status === 'match' ? 'text-emerald-400' :
                            f.status === 'mismatch' ? 'text-red-400' : 'text-amber-400'
                          }`}>{f.found_value}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{f.note}</p>
                      {f.source && (
                        <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-xs inline-block">{f.source}</a>
                      )}
                      {decisions[i] === 'saved' && (
                        <p className="text-xs text-emerald-400 mt-1 font-semibold">✓ Supabase updated automatically</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!decisions[i] && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approve(i, f)}
                        className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        <ThumbsUp size={12} /> Approve
                      </button>
                      <button
                        onClick={() => reject(i)}
                        className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        <ThumbsDown size={12} /> Reject
                      </button>
                    </div>
                  )}

                  {decisions[i] === 'saving' && (
                    <span className="text-xs text-blue-400 font-bold px-3 py-1.5 shrink-0">Updating...</span>
                  )}

                  {(decisions[i] === 'saved' || decisions[i] === 'approved') && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 bg-emerald-600/20 text-emerald-400">
                      ✓ Approved
                    </span>
                  )}

                  {decisions[i] === 'rejected' && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 bg-slate-700 text-slate-400">
                      ✗ Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mark verified button */}
          {allDecided && !allSaved && (
            <button
              onClick={markVerified}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              <Check size={15} /> Mark {countryName} as Verified Today
            </button>
          )}

          {allSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold text-sm">{countryName} fully verified and saved</p>
              <p className="text-slate-400 text-xs mt-1">All approved changes written to Supabase. Last verified date updated.</p>
            </div>
          )}

          {!allDecided && totalDecided > 0 && (
            <p className="text-slate-500 text-xs text-center mt-4">
              {totalFindings - totalDecided} findings remaining — approve or reject each one to complete
            </p>
          )}

          <p className="text-slate-500 text-xs mt-4 text-center">
            Approve = auto-updates Supabase instantly · Reject = keeps current value
          </p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Click Run AI Verification to check all {countryName} data points against live government sources</p>
        </div>
      )}
    </div>
  )
}
