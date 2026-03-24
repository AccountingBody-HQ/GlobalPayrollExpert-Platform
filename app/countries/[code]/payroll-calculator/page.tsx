import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import Calculator from '@/components/Calculator'
import type { TaxBracket, SocialSecurityRate } from '@/lib/calculator'
import type { Metadata } from 'next'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ code: string }>
  searchParams: Promise<{ salary?: string; period?: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const supabase = await createClient()
  const { data: country } = await supabase
    .from('countries')
    .select('name, currency_code')
    .eq('iso2', code.toUpperCase())
    .single()

  if (!country) return { title: 'Payroll Calculator — GlobalPayrollExpert' }

  return {
    title: `${country.name} Payroll Calculator ${new Date().getFullYear()} — GlobalPayrollExpert`,
    description: `Calculate net salary, income tax, and employer costs in ${country.name}. Full bracket breakdown, social security contributions, and PDF export.`,
    alternates: {
      canonical: `https://globalpayrollexpert.com/countries/${code.toLowerCase()}/payroll-calculator/`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export default async function PayrollCalculatorPage({ params, searchParams }: PageProps) {
  const { code } = await params
  const { salary, period } = await searchParams
  const upperCode = code.toUpperCase()
  const supabase = await createClient()

  // ── Load country ──────────────────────────────────────────────────────────
  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  // ── Load tax brackets (gpe schema) ────────────────────────────────────────
  const { data: rawBrackets } = await supabase
    .schema('gpe')
    .from('tax_brackets')
    .select('bracket_order, lower_limit, upper_limit, rate, bracket_name')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .eq('tier', 'free')
    .order('bracket_order', { ascending: true })

  // ── Load social security rates (gpe schema) ───────────────────────────────
  const { data: rawSS } = await supabase
    .schema('gpe')
    .from('social_security')
    .select('contribution_type, rate_percent, cap_amount, description')
    .eq('country_code', upperCode)
    .eq('is_current', true)

  const taxBrackets: TaxBracket[] = (rawBrackets ?? []).map((b) => ({
    bracket_order: b.bracket_order,
    lower_limit: Number(b.lower_limit),
    upper_limit: b.upper_limit !== null ? Number(b.upper_limit) : null,
    rate: Number(b.rate),
    bracket_name: b.bracket_name,
  }))

  const ssRates: SocialSecurityRate[] = (rawSS ?? []).map((s) => ({
    contribution_type: s.contribution_type,
    rate_percent: Number(s.rate_percent),
    cap_amount: s.cap_amount !== null ? Number(s.cap_amount) : null,
    description: s.description ?? s.contribution_type,
  }))

  const taxYear = new Date().getFullYear()

  // ── Structured data (JSON-LD) ─────────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${country.name} Payroll Calculator`,
    url: `https://globalpayrollexpert.com/countries/${code.toLowerCase()}/payroll-calculator/`,
    description: `Calculate net salary, income tax, and employer costs in ${country.name}.`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: country.currency_code },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50">

        {/* ── Header ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/countries" className="hover:text-slate-700 transition">Countries</Link>
              <span>/</span>
              <Link href={`/countries/${code.toLowerCase()}`} className="hover:text-slate-700 transition">
                {country.flag_emoji} {country.name}
              </Link>
              <span>/</span>
              <span className="text-slate-900">Payroll Calculator</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {country.flag_emoji} {country.name} Payroll Calculator {taxYear}
                </h1>
                <p className="mt-1.5 text-slate-500">
                  Calculate net salary, income tax, and employer costs. All figures shown monthly and annually.
                </p>
              </div>
              <Link
                href={`/countries/${code.toLowerCase()}`}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                ← Country Overview
              </Link>
            </div>

          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

          <div className="grid gap-8 lg:grid-cols-3">

            {/* Calculator — takes up 2/3 on large screens */}
            <div className="lg:col-span-2">
              <Calculator
                countryCode={upperCode}
                countryName={country.name}
                currencyCode={country.currency_code}
                taxBrackets={taxBrackets}
                ssRates={ssRates}
                taxYear={taxYear}
                isAuthenticated={false}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Data info card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">About This Data</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    Official government sources
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    Tax year {taxYear}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    Progressive bracket calculation
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    Employee and employer view
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500">⚠</span>
                    For guidance only — not tax advice
                  </li>
                </ul>
              </div>

              {/* Pro upsell */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-blue-900">Save Your Calculations</h3>
                <p className="mb-3 text-sm text-blue-700">
                  Sign up for a free account to save calculations, generate PDF reports, and compare across countries.
                </p>
                <Link
                  href="/sign-up"
                  className="block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Create Free Account
                </Link>
              </div>

              {/* Related links */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  More for {country.name}
                </h3>
                <ul className="space-y-2">
                  {[
                    { label: 'Country Overview', href: `/countries/${code.toLowerCase()}/` },
                    { label: 'Employment Law', href: `/countries/${code.toLowerCase()}/employment-law/` },
                    { label: 'Tax Guide', href: `/countries/${code.toLowerCase()}/tax-guide/` },
                    { label: 'Hiring Guide', href: `/countries/${code.toLowerCase()}/hiring-guide/` },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 transition"
                      >
                        {link.label}
                        <span className="text-slate-300">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
