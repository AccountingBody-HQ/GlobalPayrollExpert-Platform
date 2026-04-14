import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET
if (!ADMIN_SECRET) throw new Error('ADMIN_SECRET env var is not set')

async function tokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const enc = new TextEncoder()
    const [a, b] = await Promise.all([
      crypto.subtle.digest('SHA-256', enc.encode(token)),
      crypto.subtle.digest('SHA-256', enc.encode(ADMIN_SECRET!)),
    ])
    const ua = new Uint8Array(a)
    const ub = new Uint8Array(b)
    if (ua.length !== ub.length) return false
    let diff = 0
    for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
    return diff === 0
  } catch {
    return false
  }
}

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname

  // Admin pages — redirect to login if no valid token
  if (path.startsWith('/admin') && !path.startsWith('/admin-login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!await tokenValid(token)) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  // Admin API routes — return 401 if no valid token
  // excludes /api/admin-auth and /api/admin-logout (must stay public)
  if (
    path.startsWith('/api/admin-') &&
    !path.startsWith('/api/admin-auth') &&
    !path.startsWith('/api/admin-logout')
  ) {
    const token = request.cookies.get('admin_token')?.value
    if (!await tokenValid(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
