import Link from 'next/link'
import CountrySearch from '@/components/homepage/CountrySearch'
import { Globe, Calculator, Building2, Shield, ArrowRight, CheckCircle, TrendingUp, Users, Database, RefreshCw, MapPin, ChevronRight } from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', stat: 'Corp Tax: 25%', currency: 'GBP' },
  { code: 'us', name: 'United States', stat: 'Fed Tax: up to 37%', currency: 'USD' },
  { code: 'de', name: 'Germany', stat: 'Corp Tax: 15%', currency: 'EUR' },
  { code: 'fr', name: 'France', stat: 'Corp Tax: 25%', currency: 'EUR' },
  { code: 'nl', name: 'Netherlands', stat: 'Corp Tax: 25.8%', currency: 'EUR' },
  { code: 'sg', name: 'Singapore', stat: 'Corp Tax: 17%', currency: 'SGD' },
  { code: 'ae', name: 'UAE', stat: 'Corp Tax: 9%', currency: 'AED' },
  { code: 'au', name: 'Australia', stat: 'Corp Tax: 30%', currency: 'AUD' },
  { code: 'ca', name: 'Canada', stat: 'Fed Tax: 15%', currency: 'CAD' },
  { code: 'jp', name: 'Japan', stat: 'Corp Tax: 23.2%', currency: 'JPY' },
  { code: 'in', name: 'India', stat: 'Corp Tax: 22%', currency: 'INR' },
  { code: 'ch', name: 'Switzerland', stat: 'Corp Tax: 8.5%', currency: 'CHF' },
]

const REGIONS = [
  { name: 'Europe', slug: 'europe', count: 44 },
  { name: 'Americas', slug: 'americas', count: 35 },
  { name: 'Asia Pacific', slug: 'asia-pacific', count: 42 },
  { name: 'Middle East', slug: 'middle-east', count: 18 },
  { name: 'Africa', slug: 'africa', count: 56 },
]

const PLATFORM_CARDS = [
  {
    icon: Globe,
    title: 'Country Data',
    description: 'Income tax brackets, social security rates, employment rules, and payroll compliance obligations — every country, one source.',
    href: '/countries/',
    cta: 'Browse all countries',
  },
  {
    icon: Calculator,
    title: 'Payroll Calculators',
    description: 'Net pay, employer costs, tax, and social security contributions with a full line-by-line breakdown for any jurisdiction.',
    href: '/payroll-tools/',
    cta: 'Open calculators',
  },
  {
    icon: Building2,
    title: 'EOR Intelligence',
    description: 'Employer of Record cost estimators, provider analysis, and guides for international hiring without a local entity.',
    href: '/eor/',
    cta: 'Explore EOR',
  },
  {
    icon: Shield,
    title: 'HR Compliance',
    description: 'Global employment law by topic — minimum wage, leave entitlements, notice periods, probation rules, and more.',
    href: '/hr-compliance/',
    cta: 'View compliance guides',
  },
]

const TRUST_ITEMS = [
  { icon: Database, label: 'Government sources', sub: 'Direct from official tax authorities' },
  { icon: CheckCircle, label: 'Expert verified', sub: 'Reviewed by payroll professionals' },
  { icon: RefreshCw, label: 'Updated monthly', sub: 'Current rates and thresholds' },
  { icon: Users, label: 'Built for professionals', sub: 'EOR firms, HR teams, lawyers' },
]

const STATS = [
  { value: '195', label: 'Countries', sub: 'Global coverage' },
  { value: '10,000+', label: 'Data Points', sub: 'Per country' },
  { value: 'Monthly', label: 'Updates', sub: 'Always current' },
  { value: 'Free', label: 'Core Access', sub: 'No account required' },
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
  } catch (_) {
    insights = []
  }

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">

          {/* top label */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-10 bg-blue-600" />
            <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">
              Global Payroll Intelligence Platform
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* left — headline and CTAs */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8">
                The world's most comprehensive<br />
                <span className="text-blue-700">global payroll</span><br />
                intelligence platform.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
                Payroll data, calculators, and compliance guides for 195 countries. 
                Trusted by EOR firms, HR directors, lawyers, and global employers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/countries/"
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 transition-colors text-sm tracking-wide uppercase">
                  Explore Countries <ArrowRight size={16} />
                </Link>
                <Link href="/payroll-tools/global-calculator/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 font-bold px-8 py-4 transition-colors text-sm tracking-wide uppercase">
                  Try the Calculator
                </Link>
              </div>
            </div>

            {/* right — search panel */}
            <div className="bg-slate-50 border border-slate-200 p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Search any country
              </p>
              <CountrySearch />
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Browse by region</p>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <Link key={r.slug}
                      href={`/countries/?region=${r.slug}`}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 transition-all">
                      {r.name}
                      <span className="text-slate-400 ml-1">{r.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ── */}
      <section className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-700">
            {STATS.map(s => (
              <div key={s.label} className="px-8 py-8 text-center">
                <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-slate-200 font-semibold text-sm mt-1">{s.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM SECTIONS ── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

          <div className="grid lg:grid-cols-3 gap-0 mb-0">
            <div className="lg:col-span-1 pr-16 border-r border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-600" />
                <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">The Platform</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                Everything you need for global payroll.
              </h2>
              <p className="text-slate-500 leading-relaxed text-base mb-8">
                One authoritative source for country data, payroll calculations, EOR intelligence, and employment law — built for professionals who cannot afford to get it wrong.
              </p>
              <Link href="/countries/"
                className="inline-flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wide hover:gap-3 transition-all">
                View all capabilities <ArrowRight size={15} />
              </Link>
            </div>

            <div className="lg:col-span-2 pl-16">
              <div className="grid sm:grid-cols-2 gap-0 divide-y divide-slate-100">
                {PLATFORM_CARDS.map((card, i) => (
                  <Link key={card.title} href={card.href}
                    className={`group flex gap-5 p-7 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'border-r border-slate-100' : ''}`}>
                    <div className="shrink-0 mt-0.5">
                      <div className="bg-blue-700 text-white p-2.5 w-10 h-10 flex items-center justify-center">
                        <card.icon size={18} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 text-base group-hover:text-blue-700 transition-colors">{card.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
                      <div className="mt-3 text-blue-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
                        {card.cta} <ChevronRight size={12} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COUNTRIES ── */}
      <section className="bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-blue-600" />
                <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">Popular Jurisdictions</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Featured Countries</h2>
            </div>
            <Link href="/countries/"
              className="text-blue-700 font-bold text-sm uppercase tracking-wide flex items-center gap-1 hover:gap-2 transition-all">
              All 195 countries <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-slate-200">
            {FEATURED_COUNTRIES.map(c => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="group border-r border-b border-slate-200 p-6 hover:bg-white transition-colors relative">
                <div className="absolute top-0 left-0 w-0 h-0.5 bg-blue-700 group-hover:w-full transition-all duration-300" />
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://flagcdn.com/32x24/${c.code}.png`} alt={c.name}
                    width={28} height={21} className="shadow-sm" />
                  <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">{c.stat}</div>
                <div className="mt-3 text-blue-700 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View data <ChevronRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-600" />
                <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">Our Standards</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Data held to the highest standard.
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Every data point on GlobalPayrollExpert is sourced directly from official government and tax authority publications, verified by qualified payroll professionals, and updated on a rolling monthly basis.
              </p>
            </div>
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-8">
              {TRUST_ITEMS.map(item => (
                <div key={item.label} className="flex gap-4">
                  <div className="shrink-0 bg-blue-700 text-white p-2.5 w-10 h-10 flex items-center justify-center mt-0.5">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{item.label}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSIGHTS ── */}
      {insights.length > 0 && (
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-blue-600" />
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em]">Knowledge Base</span>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Latest Insights</h2>
              </div>
              <Link href="/insights/"
                className="text-blue-700 font-bold text-sm uppercase tracking-wide flex items-center gap-1 hover:gap-2 transition-all">
                All articles <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-0 border-l border-t border-slate-200">
              {insights.map((article: any) => (
                <Link key={article.slug?.current} href={`/insights/${article.slug?.current}/`}
                  className="group border-r border-b border-slate-200 p-8 hover:bg-white transition-colors relative">
                  <div className="absolute top-0 left-0 w-0 h-0.5 bg-blue-700 group-hover:w-full transition-all duration-300" />
                  {article.category && (
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{article.category}</span>
                  )}
                  <h3 className="font-bold text-slate-900 mt-3 mb-3 leading-snug text-base group-hover:text-blue-700 transition-colors">{article.title}</h3>
                  {article.excerpt && <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>}
                  <div className="mt-5 text-blue-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read article <ChevronRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EMAIL CAPTURE ── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-400" />
                <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Stay Current</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Get monthly global payroll updates.
              </h2>
              <p className="text-slate-400 leading-relaxed text-base max-w-md">
                Rate changes, new country data, compliance alerts, and payroll news — delivered once a month. Free, no spam, unsubscribe any time.
              </p>
            </div>
            <div>
              <form action="/api/subscribe" method="POST" className="flex flex-col gap-4">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-5 py-4 bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors font-medium"
                />
                <button type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 transition-colors text-sm uppercase tracking-widest">
                  Subscribe Free
                </button>
              </form>
              <p className="text-slate-600 text-xs mt-4">No spam. Unsubscribe any time. We respect your privacy.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
