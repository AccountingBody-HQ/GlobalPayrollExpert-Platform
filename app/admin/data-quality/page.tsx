import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const ALL_TABLES = [
  { key: 'tax_brackets',      label: 'Tax',        short: 'Tax' },
  { key: 'social_security',   label: 'SS',         short: 'SS' },
  { key: 'employment_rules',  label: 'Rules',      short: 'Rules' },
  { key: 'statutory_leave',   label: 'Leave',      short: 'Leave' },
  { key: 'public_holidays',   label: 'Holidays',   short: 'Hols' },
  { key: 'filing_calendar',   label: 'Filing',     short: 'Filing' },
  { key: 'payroll_compliance',label: 'Compliance', short: 'Comp' },
  { key: 'working_hours',     label: 'Hours',      short: 'Hours' },
  { key: 'termination_rules', label: 'Termination',short: 'Term' },
  { key: 'pension_schemes',   label: 'Pension',    short: 'Pension' },
]

async function getDataQualitySummary() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: countries } = await supabase
      .from('countries')
      .select('iso2, name, currency_code, last_data_update')
      .eq('is_active', true)
      .order('name')

    // Fetch presence for each table
    const tableFetches = await Promise.all(
      ALL_TABLES.map(async t => {
        // Tables with is_current
        const hasCurrentField = ['tax_brackets','social_security','employment_rules'].includes(t.key)
        let q = supabase.schema('hrlake').from(t.key).select('country_code')
        if (hasCurrentField) q = (q as any).eq('is_current', true)
        const { data } = await q
        return { key: t.key, codes: new Set((data ?? []).map((r: any) => r.country_code)) }
      })
    )

    const presenceMap = Object.fromEntries(tableFetches.map(t => [t.key, t.codes]))

    return (countries ?? []).map((c: any) => {
      const coverage = ALL_TABLES.map(t => presenceMap[t.key]?.has(c.iso2) ?? false)
      const filled = coverage.filter(Boolean).length
      return {
        ...c,
        coverage,
        filled,
        complete: filled === ALL_TABLES.length,
      }
    })
  } catch (e) {
    console.error('getDataQualitySummary error:', e)
    return []
  }
}

export default async function DataQualityPage() {
  const countries = await getDataQualitySummary()
  const complete   = countries.filter((c: any) => c.complete).length
  const partial    = countries.filter((c: any) => c.filled > 0 && !c.complete).length
  const empty      = countries.filter((c: any) => c.filled === 0).length
  const total      = countries.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Data Quality Dashboard</h1>
        <p className="text-slate-400 text-sm">10-table coverage across {total} active countries</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Countries',      value: total,    color: 'text-blue-400',    bg: 'bg-blue-600/10 border-blue-600/20' },
          { label: 'Fully Complete', value: complete, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20' },
          { label: 'Partial',        value: partial,  color: 'text-amber-400',   bg: 'bg-amber-600/10 border-amber-600/20' },
          { label: 'Empty',          value: empty,    color: 'text-red-400',     bg: 'bg-red-600/10 border-red-600/20' },
        ].map(card => (
          <div key={card.label} className={`border rounded-2xl p-5 ${card.bg}`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-white font-bold">Country Coverage — All 10 Tables</h2>
            <p className="text-slate-400 text-xs">Click Verify to run AI verification for any country</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-900">Country</th>
                  {ALL_TABLES.map(t => (
                    <th key={t.key} className="text-center px-2 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t.short}</th>
                  ))}
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Verified</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {countries.map((c: any) => (
                  <tr key={c.iso2} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 sticky left-0 bg-slate-900">
                      <div className="flex items-center gap-2">
                        <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`} alt={c.name} width={20} height={15} className="rounded-sm" />
                        <div>
                          <p className="text-white font-semibold text-sm whitespace-nowrap">{c.name}</p>
                          <p className="text-slate-500 text-xs">{c.iso2}</p>
                        </div>
                      </div>
                    </td>
                    {c.coverage.map((has: boolean, i: number) => (
                      <td key={i} className="px-2 py-3 text-center text-sm">
                        {has ? '✅' : '❌'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${c.complete ? 'bg-emerald-500' : c.filled > 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${(c.filled / ALL_TABLES.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8">{c.filled}/{ALL_TABLES.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-400 text-xs whitespace-nowrap">
                        {c.last_data_update
                          ? new Date(c.last_data_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/data-quality/${c.iso2.toLowerCase()}`}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
