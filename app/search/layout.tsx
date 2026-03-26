import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search — Countries, Calculators and Payroll Guides',
  description: 'Search GlobalPayrollExpert for any country, payroll guide, employment law topic, or compliance requirement. Coverage across 195 countries.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/search/',
  },
  robots: {
    index: false,
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
