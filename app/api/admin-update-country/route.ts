import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { countryCode, action, finding } = body

    console.log('admin-update-country called:', JSON.stringify(body))

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'approve_all') {
      const { error } = await supabase
        .from('countries')
        .update({ last_data_update: new Date().toISOString().split('T')[0] })
        .eq('iso2', countryCode)
      if (error) {
        console.error('approve_all error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    if (action === 'update_value') {
      const { table, field, new_value, record_id } = finding
      console.log('Updating:', table, field, new_value, record_id)

      if (!record_id) {
        return NextResponse.json({ error: 'No record_id provided' }, { status: 400 })
      }

      // Use raw SQL via rpc to update hrlake schema tables
      const tableMap: Record<string, string> = {
        'tax_brackets': 'hrlake.tax_brackets',
        'social_security': 'hrlake.social_security',
        'employment_rules': 'hrlake.employment_rules',
      }

      const fullTable = tableMap[table]
      if (!fullTable) {
        return NextResponse.json({ error: 'Unknown table: ' + table }, { status: 400 })
      }

      const { error } = await supabase.rpc('admin_update_field', {
        p_table: fullTable,
        p_field: field,
        p_value: String(new_value),
        p_id: record_id,
      })

      if (error) {
        console.error('update_value error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e: any) {
    console.error('admin-update-country exception:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
