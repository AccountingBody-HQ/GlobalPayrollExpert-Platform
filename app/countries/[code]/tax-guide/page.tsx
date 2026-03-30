import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

export default async function TaxGuidePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-6">
          <BookOpen className="text-blue-400" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Tax Guide Coming Soon</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          The full income tax guide for this country is being prepared.
          Check the country overview page for current tax brackets and rates.
        </p>
        <Link href={`/countries/${code}/`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <ArrowLeft size={16} /> Back to Country Overview
        </Link>
      </div>
    </main>
  )
}
