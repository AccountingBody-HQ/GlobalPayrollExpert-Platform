import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCountryByCode } from '@/lib/supabase-queries'
import { ArrowRight, BookOpen, Layers, ChevronRight } from 'lucide-react'
import { createClient } from '@sanity/client'
import CountrySubNav from '@/components/CountrySubNav'

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const country = await getCountryByCode(code)
  if (!country) return { title: 'Not Found | HRLake' }
  return {
    title: `${country.name} HR & Payroll Insights | HRLake`,
    description: `Expert analysis on HR, payroll, EOR, and employment law in ${country.name}.`,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/insights/` },
  }
}

export default async function CountryInsightsPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const iso2 = code.toUpperCase()
  const country = await getCountryByCode(iso2)
  if (!country) notFound()

  let articles: any[] = []
  try {
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
    articles = await sanity.fetch(
      `*[_type == "article" && "hrlake" in showOnSites && $country in countries] | order(publishedAt desc) {
        _id, title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`,
      { country: iso2 }
    )
  } catch { articles = [] }

  return (
    <main className="bg-slate-50 flex-1">
      <CountrySubNav code={code} countryName={country.name} />

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/countries/" className="hover:text-slate-300 transition-colors">Countries</Link>
            <ChevronRight size={12} />
            <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-300 transition-colors">{country.name}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">Insights</span>
          </nav>
          <div className="flex items-center gap-5 mb-4">
            <img
              src={`https://flagcdn.com/64x48/${code.toLowerCase()}.png`}
              alt={`${country.name} flag`}
              width={48}
              height={36}
              className="rounded-md shadow-lg border border-white/10"
            />
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Intelligence</p>
              <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white tracking-tight">
                {country.name} Insights
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mt-4">
            Expert analysis on HR, payroll, EOR, and employment law in {country.name}. Updated as published.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <Layers size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {articles.length === 0
                ? "No articles yet"
                : articles.length === 1
                ? "1 article"
                : articles.length + " articles"}
            </p>
            <p className="text-xs text-slate-500">{country.name} intelligence</p>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article._id}
                href={"/insights/" + article.slug?.current + "/"}
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
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                  )}
                  {article.publishedAt && (
                    <p className="text-xs text-slate-400 mb-2">
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            <h3 className="font-bold text-xl text-slate-900 mb-2">No articles yet for {country.name}</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Articles will appear here as they are published. Check back soon.
            </p>
            <Link
              href="/insights/"
              className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              Browse all insights <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
