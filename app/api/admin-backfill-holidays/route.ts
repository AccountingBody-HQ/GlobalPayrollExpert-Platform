import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const maxDuration = 300

async function generateHolidays(
  anthropic: Anthropic,
  countryCode: string,
  countryName: string,
  year: number
): Promise<{ holiday_name: string; holiday_date: string; is_mandatory: boolean }[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `List all official public holidays for ${countryName} (${countryCode}) for the year ${year}.

Return ONLY a JSON array. No preamble, no markdown, no explanation.

Each object must have exactly these fields:
- holiday_name: string (official English name)
- holiday_date: string (format: YYYY-MM-DD, exact date for ${year})
- is_mandatory: boolean (true if all employers must observe it)

For Islamic holidays that vary by moon sighting, use the most widely accepted predicted date.
For Ethiopian holidays, use the Gregorian calendar equivalent.

Example format:
[
  {"holiday_name": "New Year's Day", "holiday_date": "${year}-01-01", "is_mandatory": true}
]`,
      },
    ],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

export async function GET() {
  const targetYear = new Date().getFullYear()
  const supabase = createSupabaseAdminClient()
  const anthropic = new Anthropic()

  // Get all active countries
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('iso2, name')
    .eq('is_active', true)
    .order('iso2')

  if (countriesError || !countries) {
    return NextResponse.json(
      { error: 'Failed to fetch countries', detail: countriesError?.message },
      { status: 500 }
    )
  }

  const results: Record<string, { inserted: number; error?: string }> = {}

  for (const country of countries) {
    // 8 second delay between countries to respect Anthropic TPM limits
    if (countries.indexOf(country) > 0) {
      await new Promise(res => setTimeout(res, 8000))
    }

    try {
      const holidays = await generateHolidays(
        anthropic,
        country.iso2,
        country.name,
        targetYear
      )

      if (!holidays.length) {
        results[country.iso2] = { inserted: 0, error: 'AI returned no holidays' }
        continue
      }

      // Delete existing rows for this country+year then insert fresh
      await supabase
        .schema('hrlake')
        .from('public_holidays')
        .delete()
        .eq('country_code', country.iso2)
        .eq('year', targetYear)

      const { error: insertError } = await supabase
        .schema('hrlake')
        .from('public_holidays')
        .insert(
          holidays.map(h => ({
            country_code: country.iso2,
            holiday_name: h.holiday_name,
            holiday_date: h.holiday_date,
            is_mandatory: h.is_mandatory ?? true,
            year: targetYear,
          }))
        )

      if (insertError) {
        results[country.iso2] = { inserted: 0, error: insertError.message }
      } else {
        results[country.iso2] = { inserted: holidays.length }
      }
    } catch (err: unknown) {
      results[country.iso2] = {
        inserted: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }

  const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0)
  const failed = Object.entries(results)
    .filter(([, r]) => r.error)
    .map(([iso2, r]) => ({ iso2, error: r.error }))

  return NextResponse.json({
    year: targetYear,
    countries_processed: countries.length,
    total_holidays_inserted: totalInserted,
    failed,
    results,
  })
}
