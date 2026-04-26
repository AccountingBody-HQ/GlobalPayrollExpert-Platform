import { NextResponse } from 'next/server'
export async function POST() {
  const res = NextResponse.json({ ok: true })
  const expired = new Date(0).toUTCString()
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  })
  res.headers.set('Set-Cookie',
    'admin_token=; Path=/; Expires=' + expired + '; HttpOnly; Secure; SameSite=Strict'
  )
  return res
}
