// ============================================
// GLOBALPAYROLLEXPERT — NAVIGATION COMPONENT
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="globeGlow" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1"/>
                </radialGradient>
                <radialGradient id="globeFill" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#1e3a6e" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="1"/>
                </radialGradient>
              </defs>
              {/* Globe sphere */}
              <circle cx="16" cy="16" r="14" fill="url(#globeFill)" stroke="url(#globeGlow)" strokeWidth="1.2"/>
              {/* Equator */}
              <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#3b82f6" strokeWidth="0.9" strokeOpacity="0.7"/>
              {/* Upper latitude */}
              <ellipse cx="16" cy="10.5" rx="9.5" ry="3" fill="none" stroke="#60a5fa" strokeWidth="0.75" strokeOpacity="0.5"/>
              {/* Lower latitude */}
              <ellipse cx="16" cy="21.5" rx="9.5" ry="3" fill="none" stroke="#60a5fa" strokeWidth="0.75" strokeOpacity="0.5"/>
              {/* Central meridian */}
              <ellipse cx="16" cy="16" rx="5.5" ry="14" fill="none" stroke="#3b82f6" strokeWidth="0.9" strokeOpacity="0.7"/>
              {/* Left meridian */}
              <ellipse cx="16" cy="16" rx="11" ry="14" fill="none" stroke="#1d4ed8" strokeWidth="0.7" strokeOpacity="0.5"/>
              {/* Right meridian */}
              <ellipse cx="16" cy="16" rx="11" ry="14" fill="none" stroke="#1d4ed8" strokeWidth="0.7" strokeOpacity="0.5" transform="rotate(60 16 16)"/>
              {/* Highlight */}
              <ellipse cx="12" cy="11" rx="3.5" ry="2" fill="white" fillOpacity="0.08" transform="rotate(-25 12 11)"/>
            </svg>
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