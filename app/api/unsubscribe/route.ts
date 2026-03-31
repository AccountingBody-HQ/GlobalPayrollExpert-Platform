import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Check if subscriber exists and is currently subscribed
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .eq('platform', 'hrlake')
      .single()

    if (!existing || existing.status === 'unsubscribed') {
      return NextResponse.json({ success: true, already: true })
    }

    // Update status to unsubscribed
    const { error } = await supabase
      .from('email_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim())
      .eq('platform', 'hrlake')

    if (error) {
      console.error('Supabase unsubscribe error:', error)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
