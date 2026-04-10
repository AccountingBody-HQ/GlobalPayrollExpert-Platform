import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TABLE_MAP: Record<string, string> = {
  tax_brackets:      'hrlake.tax_brackets',
  social_security:   'hrlake.social_security',
  employment_rules:  'hrlake.employment_rules',
  statutory_leave:   'hrlake.statutory_leave',
  public_holidays:   'hrlake.public_holidays',
  filing_calendar:   'hrlake.filing_calendar',
  payroll_compliance:'hrlake.payroll_compliance',
  working_hours:     'hrlake.working_hours',
  termination_rules: 'hrlake.termination_rules',
  pension_schemes:   'hrlake.pension_schemes',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { countryCode, action, finding } = body

    console.log('admin-update-country:', action, countryCode)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'approve_all') {
      const { error } = await supabase
        .from('countries')
        .update({ last_data_update: new Date().toISOString().split('T')[0], hrlake_coverage_level: 'full' })
        .eq('iso2', countryCode)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'update_value') {
      const { table, field, new_value, record_id } = finding

      if (!record_id) return NextResponse.json({ error: 'No record_id provided' }, { status: 400 })

      const fullTable = TABLE_MAP[table]
      if (!fullTable) return NextResponse.json({ error: 'Unknown table: ' + table }, { status: 400 })

      console.log(`Updating ${fullTable}.${field} = ${new_value} for id=${record_id}`)

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
