import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_SECRET = 'gpe-admin-2025-secure'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value
    if (token !== ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/(admin)(.*)'],
}
