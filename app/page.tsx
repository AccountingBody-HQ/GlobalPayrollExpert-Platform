import Link from 'next/link'
import CountrySearch from '@/components/homepage/CountrySearch'
import {
  Globe, Calculator, Building2, Shield, ArrowRight,
  ChevronRight, Lock, RefreshCw, Award, TrendingUp
} from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', income: '20–45%', ss_employer: '13.8%', currency: 'GBP' },
  { code: 'us', name: 'United States',  income: '10–37%', ss_employer: '7.65%', currency: 'USD' },
  { code: 'de', name: 'Germany',         income: '14–45%', ss_employer: '~20%',  currency: 'EUR' },
  { code: 'fr', name: 'France',          income: '0–45%',  ss_employer: '~30%',  currency: 'EUR' },
  { code: 'sg', name: 'Singapore',       income: '0–22%',  ss_employer: '17%',   currency: 'SGD' },
  { code: 'ae', name: 'UAE',             income: '0%',     ss_employer: '12.5%', currency: 'AED' },
  { code: 'au', name: 'Australia',       income: '0–45%',  ss_employer: '11%',   currency: 'AUD' },
  { code: 'ch', name: 'Switzerland',     income: '0–11.5%',ss_employer: '~10%',  currency: 'CHF' },
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
    num: '01',
    title: 'Country Payroll Data',
    body: 'Income tax brackets, social security rates, payroll frequency rules, and employer obligations — every country, one authoritative source.',
    href: '/countries/',
    cta: 'Browse countries',
  },
  {
    icon: Calculator,
    num: '02',
    title: 'Payroll Calculators',
    body: 'Net pay, employer on-costs, income tax, and social security — full line-by-line payroll breakdowns for 195 jurisdictions.',
    href: '/payroll-tools/',
    cta: 'Open calculator',
  },
  {
    icon: Building2,
    num: '03',
    title: 'EOR Intelligence',
    body: 'Employer of Record cost modelling, total employment cost estimators, and hiring guides for entity-free international payroll.',
    href: '/eor/',
    cta: 'Explore EOR',
  },
  {
    icon: Shield,
    num: '04',
    title: 'Employment Law',
    body: 'Minimum wage, statutory leave, notice periods, probation rules, overtime, and termination obligations — by country.',
    href: '/hr-compliance/',
    cta: 'View guides',
  },
]

const STANDARDS = [
  { icon: Award,      title: 'Government-sourced',     body: 'Every data point traced to an official tax authority or government publication.' },
  { icon: RefreshCw,  title: 'Updated monthly',        body: 'Payroll rates and thresholds reviewed and updated on a rolling monthly cycle.' },
  { icon: Lock,       title: 'Expert verified',        body: 'Data reviewed by qualified payroll professionals before publication.' },
  { icon: TrendingUp, title: 'Expanding continuously', body: 'Coverage growing toward complete global depth across all 195 countries.' },
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

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b-2 border-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Main hero */}
          <div className="py-28 lg:py-36 max-w-5xl">

            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-0.5 bg-blue-700" />
              <span className="text-blue-700 text-xs font-black uppercase tracking-[0.3em]">
                Global Payroll Intelligence Platform
              </span>
            </div>

            <h1 className="font-serif text-[4rem] lg:text-[6rem] xl:text-[7rem] font-bold text-slate-950 leading-[0.92] tracking-tighter mb-10">
              The world<br />
              standard for<br />
              global payroll<br />
              <em className="text-blue-700 not-italic">intelligence.</em>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-2xl mb-16 font-light">
              Payroll data, calculators, and employment compliance guides for 195 countries.
              The reference platform for EOR firms, HR directors, lawyers, and global finance teams.
            </p>

            {/* Search */}
            <div className="max-w-2xl mb-10">
              <CountrySearch />
            </div>

            {/* Region links */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-300 mr-2">Browse:</span>
              {REGIONS.map(r => (
                <Link key={r.slug}
                  href={`/countries/?region=${r.slug}`}
                  className="text-xs font-bold text-slate-500 hover:text-blue-700 border border-slate-200 hover:border-blue-600 px-4 py-2 transition-all uppercase tracking-wider">
                  {r.name}
                  <span className="text-slate-300 ml-2 font-normal">{r.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t-2 border-slate-950">
            {[
              { value: '195',     label: 'Countries',    sub: 'Full global coverage' },
              { value: '10,000+', label: 'Data Points',  sub: 'Per country record' },
              { value: 'Monthly', label: 'Update Cycle', sub: 'Always current' },
              { value: 'Free',    label: 'Core Access',  sub: 'No account required' },
            ].map((s, i) => (
              <div key={s.label}
                className={`py-10 px-8 text-center ${i < 3 ? 'border-r-2 border-slate-950' : ''}`}>
                <div className="text-4xl font-black text-slate-950 tracking-tighter">{s.value}</div>
                <div className="text-sm font-bold text-slate-700 mt-1 uppercase tracking-wider">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          CAPABILITIES
      ══════════════════════════════════════════ */}
      <section className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">

          <div className="grid lg:grid-cols-[1fr_2fr] gap-24 items-end mb-24 pb-16 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-0.5 bg-blue-500" />
                <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Platform</span>
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl font-bold text-white leading-[0.95] tracking-tighter">
                Built for<br />
                professionals<br />
                who cannot<br />
                afford to get<br />
                it wrong.
              </h2>
            </div>
            <div>
              <p className="text-slate-400 text-xl leading-relaxed max-w-xl font-light mb-8">
                GlobalPayrollExpert brings together payroll data, employment tax calculations, 
                EOR intelligence, and employment law into one authoritative platform — 
                verified, current, and free to access.
              </p>
              <Link href="/countries/"
                className="inline-flex items-center gap-3 border-2 border-blue-700 hover:bg-blue-700 text-blue-400 hover:text-white font-black text-xs uppercase tracking-[0.25em] px-8 py-4 transition-all">
                Explore the platform <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {CAPABILITIES.map(cap => (
              <Link key={cap.title} href={cap.href}
                className="group px-0 lg:px-10 py-10 first:pl-0 last:pr-0 hover:bg-slate-900/60 transition-colors">
                <div className="text-slate-700 text-xs font-black uppercase tracking-[0.3em] mb-8">{cap.num}</div>
                <div className="bg-blue-700 group-hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center mb-8 transition-colors">
                  <cap.icon size={20} />
                </div>
                <h3 className="font-bold text-white text-lg mb-4 leading-tight group-hover:text-blue-300 transition-colors">{cap.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{cap.body}</p>
                <div className="flex items-center gap-2 text-blue-500 text-xs font-black uppercase tracking-[0.25em] group-hover:gap-3 transition-all">
                  {cap.cta} <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COUNTRY DATA TABLE
      ══════════════════════════════════════════ */}
      <section className="bg-white border-y-2 border-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">

          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-0.5 bg-blue-700" />
                <span className="text-blue-700 text-xs font-black uppercase tracking-[0.3em]">Payroll Data</span>
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl font-bold text-slate-950 leading-[0.95] tracking-tighter">
                Featured<br />jurisdictions.
              </h2>
            </div>
            <Link href="/countries/"
              className="hidden sm:flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-[0.25em] hover:gap-3 transition-all border-b-2 border-blue-700 pb-1">
              All 195 countries <ArrowRight size={13} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block border-2 border-slate-950">
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_140px] bg-slate-950 px-8 py-5">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Country</span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Income Tax</span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Employer SS</span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Currency</span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400"></span>
            </div>
            {FEATURED_COUNTRIES.map((c, i) => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="grid grid-cols-[2.5fr_1fr_1fr_1fr_140px] px-8 py-6 border-t-2 border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors group items-center">
                <div className="flex items-center gap-5">
                  <img src={`https://flagcdn.com/32x24/${c.code}.png`}
                    alt={c.name} width={28} height={21} className="shrink-0" />
                  <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-base">{c.name}</span>
                </div>
                <span className="font-mono text-slate-700 font-semibold">{c.income}</span>
                <span className="font-mono text-slate-700 font-semibold">{c.ss_employer}</span>
                <span className="text-slate-500 font-semibold tracking-wider">{c.currency}</span>
                <span className="flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  View full data <ChevronRight size={11} />
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden grid sm:grid-cols-2 gap-0 border-2 border-slate-950">
            {FEATURED_COUNTRIES.map((c, i) => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="group border-b-2 border-r-0 sm:odd:border-r-2 border-slate-950 p-6 hover:bg-blue-50 transition-colors relative">
                <div className="flex items-center gap-3 mb-5">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`}
                    alt={c.name} width={28} height={21} />
                  <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{c.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Income Tax</div>
                    <div className="font-mono font-bold text-slate-800">{c.income}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Employer SS</div>
                    <div className="font-mono font-bold text-slate-800">{c.ss_employer}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          DATA STANDARDS
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b-2 border-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-[1fr_3fr] gap-24">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-0.5 bg-blue-700" />
                <span className="text-blue-700 text-xs font-black uppercase tracking-[0.3em]">Our Standards</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-950 leading-[0.95] tracking-tighter">
                Data held<br />to the<br />highest<br />standard.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-0 border-l-2 border-t-2 border-slate-950">
              {STANDARDS.map((s, i) => (
                <div key={s.title}
                  className={`p-10 border-r-2 border-b-2 border-slate-950 ${i % 2 !== 0 ? 'border-r-0' : ''}`}>
                  <div className="bg-blue-700 text-white w-12 h-12 flex items-center justify-center mb-6">
                    <s.icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INSIGHTS
      ══════════════════════════════════════════ */}
      {insights.length > 0 && (
        <section className="bg-slate-50 border-b-2 border-slate-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
            <div className="flex items-end justify-between mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-0.5 bg-blue-700" />
                  <span className="text-blue-700 text-xs font-black uppercase tracking-[0.3em]">Payroll Intelligence</span>
                </div>
                <h2 className="font-serif text-5xl lg:text-6xl font-bold text-slate-950 leading-[0.95] tracking-tighter">
                  Latest analysis.
                </h2>
              </div>
              <Link href="/insights/"
                className="hidden sm:flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-[0.25em] hover:gap-3 transition-all border-b-2 border-blue-700 pb-1">
                All articles <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-0 border-l-2 border-t-2 border-slate-950">
              {insights.map((article: any) => (
                <Link key={article.slug?.current}
                  href={`/insights/${article.slug?.current}/`}
                  className="group border-r-2 border-b-2 border-slate-950 p-10 hover:bg-white transition-colors relative">
                  {article.category && (
                    <div className="text-xs font-black text-blue-700 uppercase tracking-[0.25em] mb-5">{article.category}</div>
                  )}
                  <h3 className="font-bold text-slate-900 text-lg leading-snug mb-4 group-hover:text-blue-700 transition-colors">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="mt-8 flex items-center gap-2 text-blue-700 text-xs font-black uppercase tracking-[0.25em] group-hover:gap-3 transition-all">
                    Read article <ChevronRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          EMAIL CAPTURE
      ══════════════════════════════════════════ */}
      <section className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-0.5 bg-blue-500" />
                <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Stay Informed</span>
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl font-bold text-white leading-[0.95] tracking-tighter mb-8">
                Monthly payroll<br />updates.<br />
                <span className="text-slate-600">Free. No noise.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md font-light">
                Payroll rate changes, new country data, employment law updates, 
                and compliance alerts — once a month, direct to your inbox.
              </p>
            </div>
            <div>
              <form action="/api/subscribe" method="POST" className="mb-5">
                <div className="flex border-2 border-slate-700 focus-within:border-blue-600 transition-colors">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 px-6 py-5 bg-slate-900 text-white placeholder:text-slate-600 outline-none text-base font-medium"
                  />
                  <button type="submit"
                    className="bg-blue-700 hover:bg-blue-600 text-white font-black px-10 py-5 transition-colors text-xs uppercase tracking-[0.25em] whitespace-nowrap border-l-2 border-slate-700">
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="text-slate-700 text-xs font-bold uppercase tracking-[0.2em]">
                No spam · Unsubscribe any time · We respect your privacy
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
