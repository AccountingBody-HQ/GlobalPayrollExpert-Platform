// ============================================
// GLOBALPAYROLLEXPERT — UTILITY FUNCTIONS
// ============================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// --- CLASS NAME HELPER ---
// Merges Tailwind classes safely, resolving conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- CURRENCY FORMATTER ---
// Formats a number as currency using the country's currency code
// e.g. formatCurrency(50000, 'GBP') → "£50,000.00"
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// --- PERCENT FORMATTER ---
// Formats a number as a percentage
// e.g. formatPercent(20) → "20.00%"
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

// --- NUMBER FORMATTER ---
// Formats a large number with commas
// e.g. formatNumber(1000000) → "1,000,000"
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value)
}

// --- COUNTRY CODE TO FLAG EMOJI ---
// Converts ISO country code to flag emoji
// e.g. codeToFlag('GB') → "🇬🇧"
export function codeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

// --- CAPITALISE FIRST LETTER ---
export function capitalise(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// --- TRUNCATE TEXT ---
// Truncates text to a max length and adds ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

// --- SLUGIFY ---
// Converts a string to a URL-safe slug
// e.g. slugify('United Kingdom') → "united-kingdom"
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// --- ABSOLUTE URL ---
// Builds an absolute URL from a path using the site base URL
export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hrlake.com'
  return `${base}${path}`
}

// --- REGION COLOUR ---
// Returns a Tailwind colour class for each world region
export function regionColour(region: string): string {
  const map: Record<string, string> = {
    Europe: 'bg-blue-100 text-blue-800',
    'North America': 'bg-purple-100 text-purple-800',
    'South America': 'bg-green-100 text-green-800',
    'Asia Pacific': 'bg-orange-100 text-orange-800',
    'Middle East': 'bg-yellow-100 text-yellow-800',
    Africa: 'bg-red-100 text-red-800',
  }
  return map[region] ?? 'bg-gray-100 text-gray-800'
}