'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, Globe, FileText, Loader2 } from 'lucide-react'

interface Country {
  iso2: string
  name: string
  flag_emoji: string
  region: string
  currency_code: string
  gpe_coverage_level: string
}

interface Article {
  title: string
  slug: string
  publishedAt: string
  excerpt: string
  category: string
}

interface SearchResults {
  countries: Country[]
  articles: Article[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

interface SearchBarProps {
  variant?: 'hero' | 'nav'
  placeholder?: string
  className?: string
}

export default function SearchBar({
  variant = 'hero',
  placeholder = 'Search countries, payroll data, guides…',
  className = '',
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debouncedQuery = useDebounce(query, 250)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch('/api/search?q=' + encodeURIComponent(debouncedQuery))
      .then(r => r.json())
      .then((data: SearchResults) => {
        if (!cancelled) {
          setResults(data)
          setOpen(true)
          setActiveIndex(-1)
        }
      })
      .catch(() => { if (!cancelled) setResults(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const flatItems = [
    ...(results?.countries.slice(0, 5).map(c => ({ type: 'country' as const, data: c })) ?? []),
    ...(results?.articles.slice(0, 3).map(a => ({ type: 'article' as const, data: a })) ?? []),
  ]

  const navigate = useCallback((item: typeof flatItems[0]) => {
    setOpen(false)
    setQuery('')
    if (item.type === 'country') {
      router.push('/countries/' + (item.data as Country).iso2.toLowerCase() + '/')
    } else {
      router.push('/insights/' + (item.data as Article).slug + '/')
    }
  }, [router])

  const submitSearch = useCallback(() => {
    if (!query.trim()) return
    setOpen(false)
    router.push('/search/?q=' + encodeURIComponent(query.trim()))
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || flatItems.length === 0) {
      if (e.key === 'Enter') submitSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0) {
        navigate(flatItems[activeIndex])
      } else {
        submitSearch()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const hasResults = results && (results.countries.length > 0 || results.articles.length > 0)
  const noResults = results && results.countries.length === 0 && results.articles.length === 0
  const isHero = variant === 'hero'

  const inputClasses = isHero
    ? 'w-full pl-14 pr-12 py-4 text-base font-medium bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-blue-400 text-slate-900 placeholder:text-slate-400 rounded-2xl outline-none transition-all shadow-xl shadow-black/20'
    : 'w-full pl-10 pr-8 py-2.5 text-sm bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-400 rounded-xl outline-none transition-all'

  const iconClasses = isHero
    ? 'absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
    : 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'

  const iconSize = isHero ? 20 : 16

  return (
    <div ref={containerRef} className={'relative ' + className}>
      <div className="relative">
        <Search size={iconSize} className={iconClasses} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && debouncedQuery.length >= 2) setOpen(true) }}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete="off"
          aria-label="Search"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className={'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ' + (isHero ? 'right-4' : 'right-2.5')}>
          {loading && <Loader2 size={15} className="animate-spin text-slate-400" />}
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); setResults(null); setOpen(false); inputRef.current?.focus() }}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 overflow-hidden z-50"
          role="listbox"
        >
          {results && results.countries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
                <Globe size={11} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Countries</span>
              </div>
              {results.countries.slice(0, 5).map((country, i) => {
                const isActive = activeIndex === i
                return (
                  <button
                    key={country.iso2}
                    onClick={() => navigate({ type: 'country', data: country })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={'w-full flex items-center gap-3.5 px-4 py-3 transition-colors text-left ' + (isActive ? 'bg-blue-50' : 'hover:bg-slate-50')}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span className="text-xl leading-none shrink-0">{country.flag_emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className={'font-semibold text-sm truncate ' + (isActive ? 'text-blue-700' : 'text-slate-800')}>
                        {country.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{country.region} · {country.currency_code}</div>
                    </div>
                    <ArrowRight size={13} className={'shrink-0 transition-opacity ' + (isActive ? 'text-blue-500 opacity-100' : 'text-slate-300 opacity-0')} />
                  </button>
                )
              })}
            </div>
          )}

          {results && results.articles.length > 0 && (
            <div className={results.countries.length > 0 ? 'border-t border-slate-100' : ''}>
              <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
                <FileText size={11} className="text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Articles</span>
              </div>
              {results.articles.slice(0, 3).map((article, i) => {
                const flatIdx = (results.countries.slice(0, 5).length) + i
                const isActive = activeIndex === flatIdx
                return (
                  <button
                    key={article.slug}
                    onClick={() => navigate({ type: 'article', data: article })}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    className={'w-full flex items-start gap-3.5 px-4 py-3 transition-colors text-left ' + (isActive ? 'bg-blue-50' : 'hover:bg-slate-50')}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div className="mt-0.5 shrink-0 bg-indigo-50 rounded-lg p-1.5">
                      <FileText size={13} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={'font-semibold text-sm leading-snug ' + (isActive ? 'text-blue-700' : 'text-slate-800')}>
                        {article.title}
                      </div>
                      {article.category && (
                        <div className="text-[11px] text-indigo-500 font-medium mt-0.5">{article.category}</div>
                      )}
                    </div>
                    <ArrowRight size={13} className={'shrink-0 mt-1 transition-opacity ' + (isActive ? 'text-blue-500 opacity-100' : 'text-slate-300 opacity-0')} />
                  </button>
                )
              })}
            </div>
          )}

          {noResults && (
            <div className="px-5 py-6 text-center">
              <p className="text-slate-500 text-sm font-medium">No results for <span className="text-slate-800">"{query}"</span></p>
              <p className="text-slate-400 text-xs mt-1">Try a country name, code, or topic</p>
            </div>
          )}

          {hasResults && (
            <button
              onClick={submitSearch}
              className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-blue-600 group"
            >
              <span>View all results for "{query}"</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
