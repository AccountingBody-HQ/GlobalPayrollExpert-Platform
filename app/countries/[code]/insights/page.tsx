import type { Metadata } from 'next'
import Link from 'next/link'
import { getFlag } from '@/lib/flag'
import { notFound } from 'next/navigation'
import { getCountryByCode } from '@/lib/supabase-queries'
import { getCountryInsightArticles, getCountryInsightCount } from '@/lib/sanity'
import { ArrowRight, BookOpen, Layers, ChevronRight, Newspaper } from 'lucide-react'
import CountrySubNav from '@/components/CountrySubNav'

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const country = await getCountryByCode(code)
  if (!country) return { title: 'Not Found | HRLake' }
  return {
    title: `${country.name} HR & Payroll Insights | HRLake`,
    description: `Expert analysis on HR, payroll, EOR, and employment law in ${country.name}. Updated automatically as new articles are published.`,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/insights/` },
    openGraph: {
      title: `${country.name} HR & Payroll Insights | HRLake`,
      description: `Expert analysis on HR, payroll, EOR, and employment law in ${country.name}.`,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/insights/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

const PER_PAGE = 9

export default async function CountryInsightsPage(
  { params, searchParams }: {
    params: Promise<{ code: string }>
    searchParams: Promise<{ page?: string }>
  }
) {
  const { code } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const offset = (page - 1) * PER_PAGE

  const country = await getCountryByCode(code.toUpperCase())
  if (!country) notFound()

  const [articles, totalCount] = await Promise.all([
    getCountryInsightArticles({
      countryCode: country.iso2,
      countryName: country.name,
      limit: PER_PAGE,
      offset,
    }),
    getCountryInsightCount({
      countryCode: country.iso2,
      countryName: country.name,
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <>
      <main className="bg-white flex-1">
        <CountrySubNav code={code} countryName={country.name} />

        {/* HERO */}
        <section className="relative bg-slate-950 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/countries" className="hover:text-slate-300 transition-colors">Countries</Link>
              <ChevronRight size={13} className="text-slate-700" />
              <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-300 transition-colors">
                {getFlag(country.iso2)} {country.name}
              </Link>
              <ChevronRight size={13} className="text-slate-700" />
              <span className="text-slate-400">Insights</span>
            </nav>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                  <Newspaper size={12} className="text-blue-400" />
                  <span className="text-blue-300 text-xs font-semibold tracking-wide">
                    Intelligence &middot; {country.name}
                  </span>
                </div>
                <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
                  {getFlag(country.iso2)} Insights for<br />
                  <span className="text-blue-400">{country.name}</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Expert analysis on HR, payroll, EOR, and employment law in {country.name} &mdash; updated automatically as new articles are published.
                </p>
              </div>
              <Link
                href={`/countries/${code.toLowerCase()}/`}
                className="shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all"
              >
                &larr; {country.name} Overview
              </Link>
            </div>
          </div>
        </section>

        {/* ARTICLE GRID */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                <Layers size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {totalCount === 0 ? 'No articles found' : totalCount === 1 ? '1 article' : `${totalCount} articles`}
                </p>
                <p className="text-xs text-slate-500">
                  {country.name} intelligence
                </p>
              </div>
            </div>

            {articles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/insights/${article.slug?.current}/`}
                    className="group bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
                  >
                    <div className="h-1.5 bg-blue-600" />
                    <div className="p-7 flex flex-col flex-1">
                      {article.category && (
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                          {article.category}
                        </span>
                      )}
                      <h2 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-blue-700 transition-colors">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        Read article <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                  <BookOpen size={24} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">
                  No articles yet for {country.name}
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  Articles covering {country.name} will appear here automatically as they are published.
                </p>
                <Link
                  href="/insights/"
                  className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                  Browse all insights <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-1.5">
                {page > 1 && (
                  <PaginationLink page={page - 1} code={code.toLowerCase()} label="Prev" variant="text" />
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationLink
                    key={p}
                    page={p}
                    code={code.toLowerCase()}
                    label={String(p)}
                    isActive={p === page}
                  />
                ))}
                {page < totalPages && (
                  <PaginationLink page={page + 1} code={code.toLowerCase()} label="Next" variant="text" />
                )}
              </div>
            )}

          </div>
        </section>
      </main>
    </>
  )
}

function PaginationLink({
  page, code, label, isActive, variant,
}: {
  page: number
  code: string
  label: string
  isActive?: boolean
  variant?: 'text'
}) {
  const href = `/countries/${code}/insights/${page > 1 ? `?page=${page}` : ''}`

  if (variant === 'text') {
    return (
      <Link href={href} className="px-4 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={
        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ' +
        (isActive
          ? 'bg-slate-900 text-white shadow-md'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50')
      }
    >
      {label}
    </Link>
  )
}
