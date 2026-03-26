import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Data Corrections and Enquiries',
  description: 'Get in touch with the GlobalPayrollExpert team. Report a data error, request a country update, or ask a question about our global payroll intelligence platform.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/contact/',
  },
  openGraph: {
    title: 'Contact Us — Data Corrections and Enquiries',
    description: 'Report a data error, request a country update, or ask a question about GlobalPayrollExpert.',
    url: 'https://globalpayrollexpert.com/contact/',
    siteName: 'GlobalPayrollExpert',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
