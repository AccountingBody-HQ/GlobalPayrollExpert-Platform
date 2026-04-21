import { createSupabaseAdminClient } from '@/lib/supabase'
import Link from 'next/link'
import { BarChart3, CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ALL_TABLES = [
  { key: 'tax_brackets',                group: 'core'    },
  { key: 'social_security',             group: 'core'    },
  { key: 'employment_rules',            group: 'core'    },
  { key: 'statutory_leave',             group: 'core'    },
  { key: 'public_holidays',             group: 'core'    },
  { key: 'filing_calendar',             group: 'core'    },
  { key: 'payroll_compliance',          group: 'core'    },
  { key: 'working_hours',               group: 'core'    },
  { key: 'termination_rules',           group: 'core'    },
  { key: 'pension_schemes',             group: 'core'    },
  { key: 'mandatory_benefits',          group: 'premium' },
  { key: 'health_insurance',            group: 'premium' },
  { key: 'payslip_requirements',        group: 'premium' },
  { key: 'record_retention',            group: 'premium' },
  { key: 'remote_work_rules',           group: 'premium' },
  { key: 'expense_rules',               group: 'premium' },
  { key: 'contractor_rules',            group: 'premium' },
  { key: 'work_permits',                group: 'premium' },
  { key: 'entity_setup',               group: 'premium' },
  { key: 'tax_credits',                 group: 'premium' },
  { key: 'regional_tax_rates',          group: 'premium' },
  { key: 'salary_benchmarks',           group: 'premium' },
  { key: 'government_benefit_payments', group: 'premium' },
]

const CORE_COUNT    = 10
const PREMIUM_COUNT = 13
const TOTAL_COUNT   = 23

async function getCoverageData() {
  const timeout = new Promise<any[]>(res => setTimeout(() => res([]), 10000))
  return Promise.race([fetchCoverageData(), timeout])
}

async function fetchCoverageData() {
  try {
    const sb = createSupabaseAdminClient()

    const { data: countries } = await sb
      .from('countries')
      .select('iso2, name, hrlake_coverage_level, last_data_update')
      .eq('is_active', true)
      .order('name')

    const tableFetches = await Promise.all(
      ALL_TABLES.map(async t => {
        const { data } = await sb.schema('hrlake').from(t.key).select('country_code')
        return { key: t.key, codes: new Set((data ?? []).map((r: any) => r.country_code)) }
      })
    )
    const presenceMap = Object.fromEntries(tableFetches.map(t => [t.key, t.codes]))

    return (countries ?? []).map((c: any) => {
      const coverage     = ALL_TABLES.map(t => presenceMap[t.key]?.has(c.iso2) ?? false)
      const coreCount    = coverage.slice(0, CORE_COUNT).filter(Boolean).length
      const premiumCount = coverage.slice(CORE_COUNT).filter(Boolean).length
      const filled       = coreCount + premiumCount
      const pct          = Math.round((filled / TOTAL_COUNT) * 100)
      const status       = filled === TOTAL_COUNT ? 'full' : filled > 0 ? 'partial' : 'none'
      return { ...c, filled, coreCount, premiumCount, pct, status }
    })
  } catch (e) {
    console.error('getCoverageData error:', e)
    return []
  }
}

export default async function CoverageMapPage() {
  const countries = await getCoverageData()
  const total   = countries.length
  const full    = countries.filter((c: any) => c.status === 'full')
  const partial = countries.filter((c: any) => c.status === 'partial')
  const none    = countries.filter((c: any) => c.status === 'none')

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
  const avgScore = total > 0
    ? Math.round(countries.reduce((s: number, c: any) => s + c.pct, 0) / total)
    : 0

  const SUMMARY = [
    { label: 'Total Countries',  value: total,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
    { label: 'Full Coverage',    value: full.length,    color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
    { label: 'Partial Coverage', value: partial.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    { label: 'No Data',          value: none.length,    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  ]

  const SECTIONS = [
    { title: 'Full Coverage',    icon: CheckCircle, color: '#10b981', items: full,    empty: 'No countries with full coverage yet' },
    { title: 'Partial Coverage', icon: AlertCircle, color: '#f59e0b', items: partial, empty: 'No partial countries'                },
    { title: 'No Data',          icon: XCircle,     color: '#ef4444', items: none,    empty: 'All countries have some data'        },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(167,139,250,0.12)' }}>
          <BarChart3 size={20} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Coverage Map</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Data coverage across {total} active countries — all 23 tables · avg score {avgScore}%
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SUMMARY.map(s => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="rounded-2xl border p-6 mb-6"
        style={{ background: '#0d1424', borderColor: '#1a2238' }}>
        <h2 className="text-white font-bold text-sm mb-5">Coverage Breakdown — All 23 Tables</h2>
        <div className="space-y-4">
          {[
            { label: `Full coverage (${TOTAL_COUNT}/${TOTAL_COUNT})`,   count: full.length,    pct: pct(full.length),    color: '#10b981' },
            { label: `Partial coverage (1–${TOTAL_COUNT - 1})`,         count: partial.length, pct: pct(partial.length), color: '#f59e0b' },
            { label: 'No data (0/23)',                                   count: none.length,    pct: pct(none.length),    color: '#ef4444' },
          ].map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#94a3b8' }}>{row.label}</span>
                <span className="text-xs font-bold" style={{ color: '#475569' }}>
                  {row.count} {row.count === 1 ? 'country' : 'countries'} · {row.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country sections */}
      {SECTIONS.map(section => (
        <div key={section.title} className="rounded-2xl border overflow-hidden mb-5"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>
          <div className="px-6 py-4 border-b flex items-center gap-3"
            style={{ borderColor: '#1a2238' }}>
            <section.icon size={15} style={{ color: section.color }} />
            <h2 className="text-white font-bold text-sm">{section.title}</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.color}30` }}>
              {section.items.length}
            </span>
          </div>

          {section.items.length === 0 ? (
            <p className="px-6 py-5 text-sm" style={{ color: '#334155' }}>{section.empty}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1a2238' }}>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Country</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Core 10</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Premium 13</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Total / 23</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Last Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {section.items.map((c: any, i: number) => {
                  const coreColor    = c.coreCount    === CORE_COUNT    ? '#10b981' : c.coreCount    > 5 ? '#f59e0b' : '#ef4444'
                  const premiumColor = c.premiumCount === PREMIUM_COUNT ? '#10b981' : c.premiumCount > 6 ? '#f59e0b' : '#ef4444'
                  const totalColor   = c.pct === 100 ? '#10b981' : c.pct >= 50 ? '#f59e0b' : '#ef4444'
                  return (
                    <tr key={c.iso2}
                      style={{ borderBottom: i < section.items.length - 1 ? '1px solid #111827' : 'none' }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                            alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                          <div>
                            <p className="text-white font-semibold text-sm">{c.name}</p>
                            <p className="text-xs" style={{ color: '#334155' }}>{c.iso2}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 rounded-full h-1" style={{ background: '#1e293b' }}>
                            <div className="h-1 rounded-full" style={{ width: `${(c.coreCount / CORE_COUNT) * 100}%`, background: coreColor }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: coreColor }}>{c.coreCount}/{CORE_COUNT}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 rounded-full h-1" style={{ background: '#1e293b' }}>
                            <div className="h-1 rounded-full" style={{ width: `${(c.premiumCount / PREMIUM_COUNT) * 100}%`, background: premiumColor }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: premiumColor }}>{c.premiumCount}/{PREMIUM_COUNT}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-14 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: totalColor }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: totalColor }}>{c.filled}/{TOTAL_COUNT}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs" style={{ color: '#475569' }}>
                          {c.last_data_update
                            ? new Date(c.last_data_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '\u2014'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/roodber8/data-quality/${c.iso2.toLowerCase()}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                          Verify <ArrowRight size={10} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}
