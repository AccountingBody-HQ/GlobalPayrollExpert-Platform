'use client'
import { useState } from 'react'
import { Sparkles, ChevronRight, Globe, Edit3, Check, Loader2, AlertCircle, Send } from 'lucide-react'

const SITES        = ['HRLake', 'AccountingBody', 'EthioTax']
const CONTENT_TYPES = ['Country Report','Explainer','HR Management','EOR Guide','Tax Guide','Payroll Guide','Accounting Guide','Course','Article','Hiring Guide','HR Compliance Guide','Leave and Benefits','Compliance Calendar']
const TONES        = [
  { label: 'Authoritative', desc: 'Expert, confident, definitive'  },
  { label: 'Educational',   desc: 'Clear, accessible, structured'  },
  { label: 'Technical',     desc: 'Precise, detailed, professional' },
]
const LENGTHS = [
  { label: 'Short',     desc: '~500 words',   value: 'short'    },
  { label: 'Standard',  desc: '~1,000 words', value: 'standard' },
  { label: 'Deep Dive', desc: '2,000+ words', value: 'deep'     },
]
const STEPS = ['Select','Configure','Generate','Review','Publish']

type Config = { site: string; contentType: string; country: string; topic: string; tone: string; length: string; aiSummary: string; keyTerms: string }
const EMPTY: Config = { site: '', contentType: '', country: '', topic: '', tone: 'Authoritative', length: 'standard', aiSummary: '', keyTerms: '' }

const C = {
  card:   { background: '#0d1424', border: '1px solid #1a2238', borderRadius: 16 },
  input:  { background: '#111827', border: '1px solid #1f2937' },
  active: { background: 'rgba(37,99,235,0.12)', border: '1px solid #2563eb', color: '#ffffff' },
  idle:   { background: 'rgba(255,255,255,0.03)', border: '1px solid #1f2937', color: '#64748b' },
}

export default function ContentFactoryPage() {
  const [step, setStep]               = useState(0)
  const [config, setConfig]           = useState<Config>(EMPTY)
  const [generated, setGenerated]     = useState('')
  const [edited, setEdited]           = useState('')
  const [generating, setGenerating]   = useState(false)
  const [publishing, setPublishing]   = useState(false)
  const [published, setPublished]     = useState(false)
  const [error, setError]             = useState('')
  const [showOnSites, setShowOnSites] = useState<string[]>([])
  const [canonical, setCanonical]     = useState('')

  const wordCount = (edited || generated).split(/\s+/).filter(Boolean).length
  function seoScore() {
    let s = 0
    if (wordCount >= 300) s += 25
    if (wordCount >= 800) s += 25
    if (config.topic.length >= 20) s += 25
    if (config.aiSummary.length >= 50) s += 25
    return s
  }
  function step1Valid() { return !!(config.site && config.contentType && config.topic.trim()) }

  async function handleGenerate() {
    setGenerating(true); setError('')
    try {
      const res  = await fetch('/api/content-factory/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGenerated(data.content); setEdited(data.content)
      if (data.aiSummary) setConfig(c => ({ ...c, aiSummary: data.aiSummary }))
      if (data.keyTerms)  setConfig(c => ({ ...c, keyTerms: data.keyTerms }))
      setShowOnSites([config.site]); setCanonical(config.site); setStep(3)
    } catch (e: any) { setError(e.message) }
    finally { setGenerating(false) }
  }

  async function handlePublish() {
    if (publishing) return
    setPublishing(true); setError('')
    try {
      const res  = await fetch('/api/content-factory/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...config, content: edited || generated, showOnSites, canonicalOwner: canonical }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setPublished(true)
    } catch (e: any) { setError(e.message) }
    finally { setPublishing(false) }
  }

  function reset() { setStep(0); setConfig(EMPTY); setGenerated(''); setEdited(''); setPublished(false); setError(''); setShowOnSites([]); setCanonical('') }

  function SelectCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button onClick={onClick} className="rounded-xl p-4 text-left transition-all w-full"
        style={active ? C.active : C.idle}>
        {children}
      </button>
    )
  }

  const seo = seoScore()
  const seoColor = seo >= 75 ? '#10b981' : seo >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Sparkles size={20} style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Content Factory</h1>
          <p className="text-sm" style={{ color: '#475569' }}>Generate, review and publish to all platforms via Sanity</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-10 flex-wrap gap-y-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={i === step
                ? { background: '#2563eb', color: '#ffffff' }
                : i < step
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                  : { background: 'rgba(255,255,255,0.03)', color: '#334155' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={i < step
                  ? { background: '#10b981', color: '#ffffff' }
                  : i === step
                    ? { background: 'rgba(255,255,255,0.2)', color: '#ffffff' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#334155' }}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="text-sm font-semibold">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} style={{ color: '#1e293b' }} className="mx-1" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#ef4444' }} className="shrink-0" />
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {/* ── STEP 1 SELECT ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Target Site</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>Which platform is this content primarily for?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <SelectCard key={site} active={config.site === site} onClick={() => setConfig(c => ({ ...c, site }))}>
                  <Globe size={14} className="mb-2 opacity-60" />
                  <p className="font-semibold text-sm">{site}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
                    {site === 'HRLake' ? 'hrlake.com' : site === 'AccountingBody' ? 'accountingbody.com' : 'ethiotax.com'}
                  </p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Content Type</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>What type of content do you need?</p>
            <div className="grid grid-cols-4 gap-3">
              {CONTENT_TYPES.map(type => (
                <SelectCard key={type} active={config.contentType === type} onClick={() => setConfig(c => ({ ...c, contentType: type }))}>
                  <p className="font-semibold text-xs">{type}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Country <span className="font-normal text-xs" style={{ color: '#334155' }}>(optional)</span></h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>Required for Country Reports, Tax Guides and EOR Guides</p>
            <input type="text" value={config.country}
              onChange={e => setConfig(c => ({ ...c, country: e.target.value }))}
              placeholder="e.g. United Kingdom, Germany…"
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none"
              style={C.input} />
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Topic</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>Be specific — the more detail you give, the better the output</p>
            <textarea value={config.topic} rows={3}
              onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
              placeholder="e.g. Employer payroll obligations for remote workers in the UK including PAYE, National Insurance and employer contributions…"
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none resize-none"
              style={C.input} />
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(1)} disabled={!step1Valid()}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{ background: '#2563eb', color: '#ffffff' }}>
              Continue <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 CONFIGURE ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Tone</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>How should the content feel to the reader?</p>
            <div className="grid grid-cols-3 gap-3">
              {TONES.map(t => (
                <SelectCard key={t.label} active={config.tone === t.label} onClick={() => setConfig(c => ({ ...c, tone: t.label }))}>
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs mt-1" style={{ color: '#334155' }}>{t.desc}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Length</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>How comprehensive should this article be?</p>
            <div className="grid grid-cols-3 gap-3">
              {LENGTHS.map(l => (
                <SelectCard key={l.value} active={config.length === l.value} onClick={() => setConfig(c => ({ ...c, length: l.value }))}>
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs mt-1" style={{ color: '#334155' }}>{l.desc}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)}
              className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1f2937' }}>
              Back
            </button>
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: '#2563eb', color: '#ffffff' }}>
              Continue <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 GENERATE ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-5">Ready to Generate</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Target Site',   value: config.site },
                { label: 'Content Type',  value: config.contentType },
                { label: 'Country',       value: config.country || '—' },
                { label: 'Tone',          value: config.tone },
                { label: 'Length',        value: LENGTHS.find(l => l.value === config.length)?.label ?? config.length },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: '#111827' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#334155' }}>{item.label}</p>
                  <p className="text-white text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3" style={{ background: '#111827' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#334155' }}>Topic</p>
              <p className="text-white text-sm">{config.topic}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)}
              className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1f2937' }}>
              Back
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{ background: '#2563eb', color: '#ffffff' }}>
              {generating
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><Sparkles size={14} /> Generate Content</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 REVIEW ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'SEO Score',  value: `${seo}%`, color: seoColor },
              { label: 'Word Count', value: wordCount, color: '#3b82f6' },
              { label: 'Status',     value: 'Ready to Review', color: '#10b981' },
              { label: 'Topic Chars', value: config.topic.length, color: '#64748b' },
            ].map(c => (
              <div key={c.label} className="rounded-2xl border p-4" style={C.card}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#334155' }}>{c.label}</p>
                <p className="text-xl font-black" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Edit3 size={14} style={{ color: '#3b82f6' }} /> Edit Content
              </h2>
              <button onClick={() => setEdited(generated)}
                className="text-xs font-semibold transition-colors" style={{ color: '#334155' }}>
                Reset to original
              </button>
            </div>
            <textarea value={edited} rows={20}
              onChange={e => setEdited(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono leading-relaxed"
              style={{ ...C.input, color: '#94a3b8' }} />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)}
              className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1f2937' }}>
              Regenerate
            </button>
            <button onClick={() => setStep(4)}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: '#2563eb', color: '#ffffff' }}>
              Continue to Publish <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5 PUBLISH ── */}
      {step === 4 && !published && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Show On Sites</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>Which platforms should display this article?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <button key={site}
                  onClick={() => setShowOnSites(prev => prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site])}
                  className="rounded-xl p-4 text-left transition-all"
                  style={showOnSites.includes(site) ? C.active : C.idle}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{site}</p>
                    {showOnSites.includes(site) && <Check size={13} style={{ color: '#3b82f6' }} />}
                  </div>
                  <p className="text-xs" style={{ color: '#334155' }}>Display on {site}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={C.card}>
            <h2 className="text-white font-bold text-sm mb-1">Canonical Owner</h2>
            <p className="text-xs mb-4" style={{ color: '#334155' }}>Which site owns the Google SEO ranking for this article?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <button key={site} onClick={() => setCanonical(site)}
                  className="rounded-xl p-4 text-left transition-all"
                  style={canonical === site
                    ? { background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#ffffff' }
                    : C.idle}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{site}</p>
                    {canonical === site && <Check size={13} style={{ color: '#10b981' }} />}
                  </div>
                  <p className="text-xs" style={{ color: '#334155' }}>SEO owner</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)}
              className="text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1f2937' }}>
              Back
            </button>
            <button onClick={handlePublish}
              disabled={publishing || showOnSites.length === 0 || !canonical}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{ background: '#059669', color: '#ffffff' }}>
              {publishing
                ? <><Loader2 size={14} className="animate-spin" /> Publishing…</>
                : <><Send size={14} /> Publish to Sanity</>}
            </button>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {published && (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: '#059669' }}>
            <Check size={30} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Published Successfully</h2>
          <p className="text-sm mb-2" style={{ color: '#475569' }}>
            Your article is now live in Sanity and will appear on all selected platforms within 60 seconds.
          </p>
          <p className="text-sm mb-8" style={{ color: '#334155' }}>
            Canonical owner: <span className="text-white font-semibold">{canonical}</span>
          </p>
          <button onClick={reset}
            className="flex items-center gap-2 text-sm font-bold px-8 py-3 rounded-xl transition-all mx-auto"
            style={{ background: '#2563eb', color: '#ffffff' }}>
            <Sparkles size={14} /> Create Another Article
          </button>
        </div>
      )}
    </div>
  )
}
