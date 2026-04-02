import { Suspense } from 'react'
import UnsubscribeClient from './UnsubscribeClient'

export const metadata = {
  title: 'Unsubscribe — HRLake',
  description: 'Unsubscribe from HRLake email updates.',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage() {
  return (
    <main className="bg-slate-950 flex-1 flex items-center justify-center px-6" style={{minHeight: "80vh", paddingTop: "80px", paddingBottom: "80px"}}>
      <Suspense fallback={
        <div className="text-slate-400 text-sm">Loading...</div>
      }>
        <UnsubscribeClient />
      </Suspense>
    </main>
  )
}
