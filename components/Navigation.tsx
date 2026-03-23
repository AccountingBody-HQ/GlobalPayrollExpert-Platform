// ============================================
// GLOBALPAYROLLEXPERT — NAVIGATION COMPONENT
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Countries', href: '/countries/' },
  { label: 'EOR', href: '/eor/' },
  { label: 'HR Compliance', href: '/hr-compliance/' },
  { label: 'Payroll Tools', href: '/payroll-tools/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Insights', href: '/insights/' },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* GPE Logomark */}
            <span className="flex items-center gap-2.5">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="34" height="34" rx="8" fill="#0f172a"/>
                <circle cx="17" cy="17" r="9" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
                <ellipse cx="17" cy="17" rx="5" ry="9" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
                <line x1="8" y1="17" x2="26" y2="17" stroke="#3b82f6" strokeWidth="1.5"/>
                <line x1="9.5" y1="12.5" x2="24.5" y2="12.5" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6"/>
                <line x1="9.5" y1="21.5" x2="24.5" y2="21.5" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6"/>
              </svg>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-black text-slate-900 tracking-tight">GLOBAL PAYROLL</span>
                <span className="text-sm font-black text-blue-700 tracking-tight">EXPERT</span>
              </span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Go Pro
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            <Link
              href="/sign-in"
              className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Go Pro
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}