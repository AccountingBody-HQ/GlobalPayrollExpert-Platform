import Link from 'next/link'
import CountrySearch from '@/components/homepage/CountrySearch'
import {
  Globe, Calculator, Building2, Shield, ArrowRight,
  ChevronRight, TrendingUp, Lock, RefreshCw, Award
} from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', corp: '25%', income: '20–45%', currency: 'GBP' },
  { code: 'us', name: 'United States',  corp: '21%', income: '10–37%', currency: 'USD' },
  { code: 'de', name: 'Germany',         corp: '15%', income: '14–45%', currency: 'EUR' },
  { code: 'fr', name: 'France',          corp: '25%', income: '0–45%',  currency: 'EUR' },
  { code: 'sg', name: 'Singapore',       corp: '17%', income: '0–22%',  currency: 'SGD' },
  { code: 'ae', name: 'UAE',             corp: '9%',  income: '0%',     currency: 'AED' },
  { code: 'au', name: 'Australia',       corp: '30%', income: '0–45%',  currency: 'AUD' },
  { code: 'ch', name: 'Switzerland',     corp: '8.5%',income: '0–11.5%',currency: 'CHF' },
]

const REGIONS = [
  { name: 'Europe',       slug: 'europe',       count: 44 },
  { name: 'Americas',     slug: 'americas',     count: 35 },
  { name: 'Asia Pacific', slug: 'asia-pacific', count: 42 },
  { name: 'Middle East',  slug: 'middle-east',  count: 18 },
  { name: 'Africa',       slug: 'africa',       count: 56 },
]

const CAPABILITIES = [
  {
    icon: Globe,
    label: '01',
    title: 'Country Intelligence',
    body: 'Income tax brackets, social security rates, employment rules, and compliance obligations — every country, one authoritative source.',
    href: '/countries/',
  },
  {
    icon: Calculator,
    label: '02',
    title: 'Payroll Calculators',
    body: 'Net pay, employer costs, and full tax breakdowns. Built for precision across 195 jurisdictions.',
    href: '/payroll-tools/',
  },
  {
    icon: Building2,
    label: '03',
    title: 'EOR Intelligence',
    body: 'Employer of Record cost modelling, provider analysis, and compliance guides for entity-free hiring.',
    href: '/eor/',
  },
  {
    icon: Shield,
    label: '04',
    title: 'HR & Compliance',
    body: 'Global employment law by topic — minimum wage, leave, notice periods, probation, and termination rules.',
    href: '/hr-compliance/',
  },
]

const STANDARDS = [
  { icon: Award,      title: 'Government-sourced',  body: 'Every data point traced to an official tax authority or government publication.' },
  { icon: RefreshCw,  title: 'Updated monthly',     body: 'Rates and thresholds reviewed and updated on a rolling monthly cycle.' },
  { icon: Lock,       title: 'Expert verified',     body: 'Data reviewed by qualified payroll professionals before publication.' },
  { icon: TrendingUp, title: 'Continuously expanding', body: 'Coverage growing from 195 countries toward complete global depth.' },
]

export default async function HomePage() {
  let insights: any[] = []
  try {
    const { createClient } = await import('@sanity/client')
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
    insights = await sanity.fetch(
      `*[_type == "post" && "globalpayrollexpert" in showOnSites] | order(publishedAt desc)[0...3] {
        title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`
    )
  } catch (_) { insights = [] }

  return (
    <main className="min-h-screen bg-white">

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Main hero grid */}
          <div className="grid lg:grid-cols-[1fr_420px] gap-0 min-h-[88vh] items-center border-b border-slate-200">

            {/* LEFT — headline block */}
            <div className="py-24 lg:pr-20 border-r border-slate-200">

              <div className="flex items-center gap-3 mb-12">
                <div className="w-8 h-px bg-blue-700" />
                <span className="text-blue-700 text-xs font-bold uppercase tracking-[0.25em]">
                  Global Payroll Intelligence
                </span>
              </div>

              <h1 className="font-serif text-[3.25rem] lg:text-[4.5rem] xl:text-[5.25rem] font-bold text-slate-950 leading-[1.0] tracking-tight mb-10">
                The world standard<br />
                for global payroll<br />
                <span className="text-blue-700">intelligence.</span>
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed max-w-xl mb-14 font-light">
                Payroll data, calculators, and compliance guides for 195 countries. 
                The reference platform for EOR firms, HR directors, lawyers, 
                and global finance teams.
              </p>

              {/* Search */}
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Search any country
                </p>
                <CountrySearch />
              </div>

              {/* Region links */}
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <Link key={r.slug}
                    href={`/countries/?region=${r.slug}`}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-4 py-2 transition-all">
                    {r.name} <span className="text-slate-300 ml-1">{r.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT — data preview panel */}
            <div className="hidden lg:flex flex-col py-24 pl-12">

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Live Data Preview</p>
                <p className="text-xs text-slate-400">Sample from our country database</p>
              </div>

              <div className="border border-slate-200 flex-1 flex flex-col overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_60px_60px] gap-0 bg-slate-950 px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Country</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Corp</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Income</span>
                </div>
                {/* Table rows */}
                {FEATURED_COUNTRIES.slice(0, 8).map((c, i) => (
                  <Link key={c.code} href={`/countries/${c.code}/`}
                    className="grid grid-cols-[1fr_60px_60px] gap-0 px-4 py-3 border-t border-slate-100 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <img src={`https://flagcdn.com/20x15/${c.code}.png`}
                        alt={c.name} width={20} height={15} className="shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{c.name}</span>
                    </div>
                    <span className="text-sm text-slate-600 text-right font-mono">{c.corp}</span>
                    <span className="text-sm text-slate-600 text-right font-mono">{c.income}</span>
                  </Link>
                ))}
                <Link href="/countries/"
                  className="mt-auto border-t border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-3 flex items-center justify-between transition-colors group">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-700">View all 195 countries</span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-700" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
            {[
              { value: '195',     label: 'Countries covered' },
              { value: '10,000+', label: 'Data points' },
              { value: 'Monthly', label: 'Update cycle' },
              { value: 'Free',    label: 'Core access' },
            ].map(s => (
              <div key={s.label} className="py-8 px-8 text-center">
                <div className="text-3xl font-bold text-slate-950 tracking-tight">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════
          CAPABILITIES
      ════════════════════════════════════ */}
      <section className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">

          <div className="grid lg:grid-cols-[1fr_2fr] gap-20 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-blue-500" />
                <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em]">Platform</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Built for professionals<br />who cannot afford<br />to get it wrong.
              </h2>
            </div>
            <div className="flex items-end">
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                GlobalPayrollExpert brings together country tax data, payroll calculation, 
                EOR intelligence, and employment law into one authoritative platform — 
                verified, current, and free to access.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {CAPABILITIES.map(cap => (
              <Link key={cap.title} href={cap.href}
                className="group px-0 sm:px-8 py-10 first:pl-0 last:pr-0 hover:bg-slate-900 transition-colors">
                <div className="text-slate-700 text-xs font-bold uppercase tracking-widest mb-6">{cap.label}</div>
                <div className="bg-blue-700 group-hover:bg-blue-600 text-white p-3 w-11 h-11 flex items-center justify-center mb-6 transition-colors">
                  <cap.icon size={20} />
                </div>
                <h3 className="font-bold text-white text-lg mb-3 group-hover:text-blue-300 transition-colors">{cap.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{cap.body}</p>
                <div className="flex items-center gap-1 text-blue-500 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          COUNTRY DATA TABLE
      ════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">

          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-blue-700" />
                <span className="text-blue-700 text-xs font-bold uppercase tracking-[0.25em]">Country Data</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-950 leading-tight tracking-tight">
                Featured jurisdictions.
              </h2>
            </div>
            <Link href="/countries/"
              className="hidden sm:flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-widest hover:gap-3 transition-all">
              All 195 countries <ArrowRight size={15} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block border border-slate-200">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] bg-slate-950 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Country</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Corp Tax</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Income Tax</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currency</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400"></span>
            </div>
            {FEATURED_COUNTRIES.map((c, i) => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] px-6 py-5 border-t border-slate-100 hover:bg-slate-50 transition-colors group items-center">
                <div className="flex items-center gap-4">
                  <img src={`https://flagcdn.com/32x24/${c.code}.png`}
                    alt={c.name} width={28} height={21} />
                  <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{c.name}</span>
                </div>
                <span className="font-mono text-slate-700 font-semibold">{c.corp}</span>
                <span className="font-mono text-slate-700">{c.income}</span>
                <span className="text-slate-500 font-medium">{c.currency}</span>
                <span className="flex items-center gap-1 text-blue-700 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  View data <ChevronRight size={11} />
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile grid */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_COUNTRIES.map(c => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="group border border-slate-200 hover:border-blue-300 p-5 transition-all relative">
                <div className="absolute top-0 left-0 w-0 h-0.5 bg-blue-700 group-hover:w-full transition-all duration-300" />
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`}
                    alt={c.name} width={28} height={21} />
                  <span className="font-bold text-slate-900">{c.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Corp Tax</div>
                    <div className="font-mono font-semibold text-slate-800">{c.corp}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Income Tax</div>
                    <div className="font-mono font-semibold text-slate-800">{c.income}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link href="/countries/"
              className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-widest">
              All 195 countries <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════
          DATA STANDARDS
      ════════════════════════════════════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="grid lg:grid-cols-[1fr_3fr] gap-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-blue-700" />
                <span className="text-blue-700 text-xs font-bold uppercase tracking-[0.25em]">Our Standards</span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-slate-950 leading-tight tracking-tight">
                Data held to the highest standard.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-0 border-l border-t border-slate-200">
              {STANDARDS.map((s, i) => (
                <div key={s.title}
                  className={`p-8 border-r border-b border-slate-200 ${i % 2 !== 0 ? 'border-r-0' : ''}`}>
                  <div className="bg-blue-700 text-white p-2.5 w-10 h-10 flex items-center justify-center mb-5">
                    <s.icon size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          INSIGHTS
      ════════════════════════════════════ */}
      {insights.length > 0 && (
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-blue-700" />
                  <span className="text-blue-700 text-xs font-bold uppercase tracking-[0.25em]">Insights</span>
                </div>
                <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight">
                  Latest analysis.
                </h2>
              </div>
              <Link href="/insights/"
                className="hidden sm:flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-widest hover:gap-3 transition-all">
                All articles <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-0 border-l border-t border-slate-200">
              {insights.map((article: any) => (
                <Link key={article.slug?.current}
                  href={`/insights/${article.slug?.current}/`}
                  className="group border-r border-b border-slate-200 p-10 hover:bg-slate-50 transition-colors relative">
                  <div className="absolute top-0 left-0 h-0.5 w-0 bg-blue-700 group-hover:w-full transition-all duration-300" />
                  {article.category && (
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4">{article.category}</div>
                  )}
                  <h3 className="font-bold text-slate-900 text-lg leading-snug mb-4 group-hover:text-blue-700 transition-colors">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="mt-6 flex items-center gap-1 text-blue-700 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                    Read article <ChevronRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          EMAIL CAPTURE
      ════════════════════════════════════ */}
      <section className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em]">Stay Informed</span>
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              Monthly global payroll updates.<br />
              <span className="text-slate-500">Free. No noise.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-xl">
              Rate changes, new country data, compliance alerts, and analysis — 
              once a month, direct to your inbox.
            </p>
            <form action="/api/subscribe" method="POST"
              className="flex flex-col sm:flex-row gap-0 max-w-lg border border-slate-700">
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 bg-slate-900 text-white placeholder:text-slate-600 outline-none focus:bg-slate-800 transition-colors text-base border-r border-slate-700"
              />
              <button type="submit"
                className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-8 py-4 transition-colors text-sm uppercase tracking-widest whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-slate-700 text-xs mt-5 uppercase tracking-wider">
              No spam · Unsubscribe any time · We respect your privacy
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
