import CurrencyConverterClient from './CurrencyConverterClient'

export const metadata = {
  title: 'Salary Currency Converter | HRLake',
  description: 'Convert any salary between currencies using live exchange rates. Benchmark compensation across international markets for HR and global workforce planning.',
}

export default function CurrencyConverterPage() {
  return (
    <main className="bg-white flex-1">

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <a href="/payroll-tools/" className="hover:text-slate-300 transition-colors">Payroll Tools</a>
            <span className="text-slate-700">›</span>
            <span className="text-slate-400">Currency Converter</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Salary Currency Converter</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5" style={{ letterSpacing: '-0.025em' }}>
              Convert salaries<br />across <span className="text-blue-400">any currency</span>.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Enter a salary in any currency and convert it to another using live exchange rates. Useful for benchmarking compensation across international markets.
            </p>
          </div>
        </div>
      </section>

      {/* Converter */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <CurrencyConverterClient />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Disclaimer:</span> Exchange rates are provided for indicative purposes only and are sourced from open exchange rate data updated daily. Rates may differ from bank or payroll provider rates. Always confirm current rates before making payment decisions.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
