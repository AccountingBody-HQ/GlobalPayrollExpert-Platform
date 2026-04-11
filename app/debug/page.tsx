import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getDebugData() {
  const { data: guides } = await supabase.schema('hrlake')
    .from('eor_guides')
    .select('country_code, is_current, risk_level, hire_speed, recommendation_title')
    .eq('is_current', true);

  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name')
    .eq('is_active', true)
    .order('name');

  return { guides, countries };
}

export default async function DebugPage() {
  const { guides, countries } = await getDebugData();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Data Debug</h1>
      
      <h2 className="text-xl font-bold mb-2">Countries WITH EOR Guide Data ({guides?.length || 0}):</h2>
      <ul className="mb-6">
        {guides?.map(g => (
          <li key={g.country_code} className="text-sm">
            <strong>{g.country_code}</strong>: {g.risk_level} risk, {g.hire_speed} speed - "{g.recommendation_title?.substring(0, 60)}..."
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mb-2">All Active Countries ({countries?.length || 0}):</h2>
      <ul className="mb-6">
        {countries?.map(c => {
          const hasGuide = guides?.some(g => g.country_code === c.iso2);
          return (
            <li key={c.iso2} className={`text-sm ${hasGuide ? 'text-green-600' : 'text-red-600'}`}>
              {c.iso2} ({c.name}): {hasGuide ? 'HAS GUIDE' : 'NO GUIDE'}
            </li>
          );
        })}
      </ul>

      <h2 className="text-xl font-bold mb-2">Brazil & Ethiopia Status:</h2>
      <div className="text-sm">
        <div>Brazil: {countries?.find(c => c.iso2 === 'BR') ? '✅ Country exists' : '❌ Country missing'} | {guides?.find(g => g.country_code === 'BR') ? '✅ Guide exists' : '❌ Guide missing'}</div>
        <div>Ethiopia: {countries?.find(c => c.iso2 === 'ET') ? '✅ Country exists' : '❌ Country missing'} | {guides?.find(g => g.country_code === 'ET') ? '✅ Guide exists' : '❌ Guide missing'}</div>
      </div>
    </div>
  );
}