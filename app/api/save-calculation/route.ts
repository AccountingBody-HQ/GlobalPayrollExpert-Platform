import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Check Pro plan
  const supabaseCheck = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: subscription } = await supabaseCheck
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .eq('platform', 'gpe')
    .single()

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'
  if (!isPro) {
    return NextResponse.json({ error: 'Pro plan required', upgrade: true }, { status: 403 })
  }

  const body = await req.json()
  const { country_code, gross_salary, period, label, calculation_result } = body

  if (!country_code || !gross_salary || !calculation_result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Generate a deterministic hash from user + country + salary + period
  // This prevents duplicates at the database level
  const hashInput = `${userId}:${country_code.toUpperCase()}:${gross_salary}:${period}`
  const calculation_hash = createHash('sha256').update(hashInput).digest('hex')

  // Attempt insert — database unique constraint will reject true duplicates
  const { error } = await supabase
    .schema('gpe')
    .from('saved_calculations')
    .insert({
      user_id: userId,
      country_code: country_code.toUpperCase(),
      name: label || `${country_code.toUpperCase()} — ${new Date().toLocaleDateString('en-GB')}`,
      calculation_type: 'payroll',
      inputs: { gross_salary, period },
      results: calculation_result,
      data_snapshot: calculation_result,
      rates_valid_as_of: new Date().toISOString().split('T')[0],
      calculation_hash,
    })

  if (error) {
    // Unique constraint violation — already saved
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: true, 
        duplicate: true, 
        message: 'This calculation is already saved in your dashboard.' 
      })
    }
    // Profile not found — user signed up before webhook was live
    if (error.code === '23503') {
      // Create profile on the fly as fallback
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const { currentUser } = await import('@clerk/nextjs/server')
      const user = await currentUser()
      const email = user?.emailAddresses?.[0]?.emailAddress || ''
      const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email
      await supabase.from('profiles').upsert({ id: userId, email, full_name: fullName }, { onConflict: 'id' })
      
      // Retry the insert
      const { error: retryError } = await supabase
        .schema('gpe')
        .from('saved_calculations')
        .insert({
          user_id: userId,
          country_code: country_code.toUpperCase(),
          name: label || `${country_code.toUpperCase()} — ${new Date().toLocaleDateString('en-GB')}`,
          calculation_type: 'payroll',
          inputs: { gross_salary, period },
          results: calculation_result,
          data_snapshot: calculation_result,
          rates_valid_as_of: new Date().toISOString().split('T')[0],
          calculation_hash,
        })
      if (retryError && retryError.code !== '23505') {
        console.error('Retry save error:', retryError.message)
        return NextResponse.json({ error: 'Failed to save calculation.' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }
    console.error('Save calculation error:', error.message, error.code)
    return NextResponse.json({ error: 'Failed to save calculation.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
