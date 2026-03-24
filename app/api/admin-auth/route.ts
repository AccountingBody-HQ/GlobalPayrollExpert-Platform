import { NextResponse } from 'next/server'

const ADMIN_SECRET = 'gpe-admin-2025-secure'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password === ADMIN_SECRET) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', ADMIN_SECRET, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
