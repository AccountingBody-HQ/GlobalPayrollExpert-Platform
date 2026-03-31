import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import VerifyClient from './VerifyClient'

async function getCountryData(iso2: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2.toUpperCase())
    .single()

  if (!country) return null

  const { data: brackets } = await supabase
    .schema('hrlake').from('tax_brackets')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('bracket_order')

  const { data: ss } = await supabase
    .schema('hrlake').from('social_security')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)

  const { data: rules } = await supabase
    .schema('hrlake').from('employment_rules')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)

  return { country, brackets: brackets ?? [], ss: ss ?? [], rules: rules ?? [] }
}

export default async function VerifyCountryPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country: code } = await params
  const data = await getCountryData(code)
  if (!data) notFound()

  const { country, brackets, ss, rules } = data

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/data-quality"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center gap-3">
          <img
            src={`https://flagcdn.com/32x24/${code.toLowerCase()}.png`}
            alt={country.name}
            width={32}
            height={24}
            className="rounded-sm"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{country.name} — Data Verification</h1>
            <p className="text-slate-400 text-sm">{code.toUpperCase()} · {country.currency_code} · Last updated: {country.last_data_update ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* AI Verification Panel */}
      <VerifyClient
        countryCode={code.toUpperCase()}
        countryName={country.name}
        brackets={brackets}
        ss={ss}
        rules={rules}
        currencyCode={country.currency_code}
      />

      {/* Current Data */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">

        {/* Tax Brackets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm">Tax Brackets ({brackets.length})</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {brackets.map((b: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-semibold">{b.bracket_name}</p>
                  <p className="text-slate-500 text-xs">
                    {b.lower_limit?.toLocaleString()} — {b.upper_limit?.toLocaleString() ?? '∞'}
                  </p>
                </div>
                <span className="text-blue-400 font-bold text-sm">{b.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm">Social Security ({ss.length})</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {ss.map((r: any, i: number) => (
              <div key={i} className="px-5 py-3">
                <p className="text-white text-xs font-semibold mb-1">{r.contribution_type}</p>
                <div className="flex gap-4">
                  <span className="text-slate-400 text-xs">ER: <span className="text-emerald-400 font-bold">{r.employer_rate}%</span></span>
                  <span className="text-slate-400 text-xs">EE: <span className="text-sky-400 font-bold">{r.employee_rate}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm">Employment Rules ({rules.length})</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {rules.map((r: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{r.rule_type.replace(/_/g, ' ')}</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {r.value_text ?? `${r.value_numeric} ${r.value_unit ?? ''}`}
                  </p>
                </div>
                {r.source_url && (
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={12} className="text-slate-500 hover:text-blue-400" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
