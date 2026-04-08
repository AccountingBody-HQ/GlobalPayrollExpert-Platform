import type { Metadata } from 'next'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Contact Us — Data Corrections and Enquiries',
  description: 'Get in touch with the HRLake team. Report a data error, request a country update, or ask a question about our global payroll intelligence platform.',
  alternates: {
    canonical: 'https://hrlake.com/contact/',
  },
  openGraph: {
    title: 'Contact Us — Data Corrections and Enquiries',
    description: 'Report a data error, request a country update, or ask a question about HRLake.',
    url: 'https://hrlake.com/contact/',
    siteName: 'HRLake',
    type: 'website',
  },
}

const breadcrumb = getBreadcrumbStructuredData([
  { name: 'Home', href: 'https://hrlake.com' },
  { name: 'Contact', href: 'https://hrlake.com/contact/' },
])

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumb) }} />
      {children}
    </>
  )
}
