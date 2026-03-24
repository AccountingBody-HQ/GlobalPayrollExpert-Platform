import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are a payroll data verification expert. Always respond with valid JSON only. No markdown, no explanation, no code blocks. Just the raw JSON object.',
      }),
    })

    const data = await response.json()
    console.log('Anthropic response status:', response.status)
    console.log('Anthropic response:', JSON.stringify(data).slice(0, 500))
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('verify-country error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
