import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search — Countries, Calculators and Payroll Guides',
  description: 'Search HRLake for any country, payroll guide, employment law topic, or compliance requirement. Coverage across 195 countries.',
  alternates: {
    canonical: 'https://hrlake.com/search/',
  },
  robots: {
    index: false,
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
