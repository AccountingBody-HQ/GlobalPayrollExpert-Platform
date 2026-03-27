'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, User, LayoutDashboard, LogOut, ChevronDown, Crown } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { useUser, useClerk } from '@clerk/nextjs'

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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] || 'Account'

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              GlobalPayrollExpert
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* SEARCH — desktop */}
          <div className="hidden md:block flex-1 lg:flex-none lg:w-56 xl:w-64">
            <SearchBar variant="nav" />
          </div>

          {/* CTA — signed out */}
          {!isSignedIn && (
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
              <Link href="/sign-in"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link href="/pricing/"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                Go Pro
              </Link>
            </div>
          )}

          {/* USER MENU — signed in */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0 relative">
              <Link href="/pricing/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 text-sm font-semibold text-blue-400 transition-colors"
              >
                <Crown size={13} /> Go Pro
              </Link>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={13} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300">{firstName}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  <Link href="/dashboard/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} className="text-blue-400" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/saved/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={15} className="text-blue-400" />
                    Saved Calculations
                  </Link>
                  <div className="border-t border-slate-700 my-1" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ redirectUrl: '/' }) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800/80">
          <div className="px-4 py-3">
            <SearchBar variant="nav" placeholder="Search countries…" />
          </div>
          <nav className="px-2 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-slate-800/80 flex gap-2">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link href="/pricing/"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Go Pro
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ redirectUrl: '/' }) }}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
