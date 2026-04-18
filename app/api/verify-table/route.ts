import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const TABLE_LABELS: Record<string, string> = {
  tax_brackets:"Tax Brackets", social_security:"Social Security",
  employment_rules:"Employment Rules", statutory_leave:"Statutory Leave",
  public_holidays:"Public Holidays", filing_calendar:"Filing Calendar",
  payroll_compliance:"Payroll Compliance", working_hours:"Working Hours",
  termination_rules:"Termination Rules", pension_schemes:"Pension Schemes",
  mandatory_benefits:"Mandatory Benefits", health_insurance:"Health Insurance",
  payslip_requirements:"Payslip Requirements", record_retention:"Record Retention",
  remote_work_rules:"Remote Work Rules", expense_rules:"Expense Rules",
  contractor_rules:"Contractor Rules", work_permits:"Work Permits",
  entity_setup:"Entity Setup", tax_credits:"Tax Credits",
  regional_tax_rates:"Regional Tax Rates", salary_benchmarks:"Salary Benchmarks",
  government_benefit_payments:"Gov. Benefit Payments",
}

const TABLE_FIELDS: Record<string, string[]> = {
  tax_brackets:                ["bracket_name","lower_limit","upper_limit","rate"],
  social_security:             ["contribution_type","employer_rate","employee_rate","employer_cap_annual","employee_cap_annual","applies_above","applies_below"],
  employment_rules:            ["rule_type","value_text","value_numeric","value_unit"],
  statutory_leave:             ["leave_type","minimum_days","maximum_days","is_paid","payment_rate"],
  public_holidays:             ["holiday_name","holiday_date","is_mandatory"],
  filing_calendar:             ["filing_type","frequency","due_day","due_month"],
  payroll_compliance:          ["description","frequency","deadline_description"],
  working_hours:               ["standard_hours_per_week","maximum_hours_per_week","overtime_rate_multiplier"],
  termination_rules:           ["notice_period_min_days","severance_mandatory","probation_period_max_months","severance_cap_months"],
  pension_schemes:             ["scheme_name","employer_rate","employee_rate","is_mandatory"],
  mandatory_benefits:          ["benefit_name","benefit_type","employer_cost_percentage","frequency"],
  health_insurance:            ["scheme_name","scheme_type","employer_rate_percentage","is_mandatory"],
  payslip_requirements:        ["format_requirements","delivery_deadline_days","retention_period_years"],
  record_retention:            ["record_type","retention_years","retention_basis"],
  remote_work_rules:           ["pe_risk_threshold_days","tax_liability_threshold_days","digital_nomad_visa_available"],
  expense_rules:               ["expense_type","tax_treatment","exempt_amount","mileage_rate_per_km"],
  contractor_rules:            ["classification_test","misclassification_penalty"],
  work_permits:                ["permit_type","processing_days_min","processing_days_max","validity_months"],
  entity_setup:                ["entity_type","corporate_tax_rate","withholding_tax_rate","vat_rate"],
  tax_credits:                 ["credit_name","credit_type","amount","rate_percentage"],
  regional_tax_rates:          ["region_name","tax_type","rate","applies_above"],
  salary_benchmarks:           ["job_family","job_level","percentile_50","currency_code"],
  government_benefit_payments: ["benefit_type","paid_by","government_rate_percentage","maximum_duration_weeks"],
}

const FIELD_CONSTRAINTS: Record<string, string> = {
  record_retention: "CONSTRAINT: retention_basis must be exactly one of: from_date_of_document | from_end_of_tax_year | from_termination — no other values are valid",
}

function fmtRows(rows: any[], fields: string[]): string {
  if (!rows || rows.length === 0) return "  (no records — table is empty)"
  return rows.map(r =>
    `  - id:${r.id} | ${fields.map(f => `${f}=${JSON.stringify(r[f] ?? null)}`).join(", ")}`
  ).join("\n")
}

function buildPrompt(
  tableKey: string,
  rows: any[],
  sourceUrl: string | null,
  authorityName: string | null,
  countryName: string,
  countryCode: string,
): string {
  const label = TABLE_LABELS[tableKey] ?? tableKey
  const fields = TABLE_FIELDS[tableKey] ?? []
  const currentYear = new Date().getFullYear()
  const srcLine = sourceUrl
    ? `AUTHORITATIVE DOMAIN: ${sourceUrl} (${authorityName}) — search this entire website for current ${currentYear} figures`
    : `Search the official government website for ${countryName} for current ${currentYear} figures`
  const constraint = FIELD_CONSTRAINTS[tableKey] ? `\n9. ${FIELD_CONSTRAINTS[tableKey]}` : ""

  return `You are a payroll data verification expert. Verify the following ${label} data for ${countryName} (${countryCode}).

CRITICAL RULES — FOLLOW EXACTLY:
1. Use web_search — minimum one search. Never skip.
2. ${srcLine}
3. Look for ${currentYear} figures. If not yet published, use most recent official figures and note the year.
4. NEVER rely on training data alone — every figure must be confirmed with a live web search.
5. Search using "${countryName} ${label} ${currentYear} official" to find current government pages.
6. Always use primary government sources — never third-party summaries or news articles.
7. Verify EVERY SINGLE RECORD listed. Do not skip any record under any circumstances.
8. Return ONE JSON object with a findings array. No markdown, no code blocks.${constraint}

=== ${label.toUpperCase()} ===
${srcLine}
${fmtRows(rows, fields)}

Respond ONLY with raw JSON:
{
  "summary": "What you searched and verified",
  "findings": [
    {
      "table": "${tableKey}",
      "record_id": "exact id from above",
      "field": "exact_column_name",
      "current_value": "current readable value",
      "found_value": "value from official source",
      "raw_value": {"field": value},
      "status": "match|mismatch|unverified",
      "source": "official URL",
      "note": "brief explanation"
    }
  ]
}`
}

export async function POST(req: NextRequest) {
  try {
    const { tableKey, tableData, sourceUrl, authorityName, countryCode, countryName } = await req.json()

    if (!tableKey || !countryCode || !countryName) {
      return NextResponse.json({ error: "Missing tableKey, countryCode or countryName" }, { status: 400 })
    }
    if (!TABLE_LABELS[tableKey]) {
      return NextResponse.json({ error: `Unknown tableKey: ${tableKey}` }, { status: 400 })
    }

    const rows = Array.isArray(tableData) ? tableData : tableData ? [tableData] : []
    const prompt = buildPrompt(tableKey, rows, sourceUrl ?? null, authorityName ?? null, countryName, countryCode)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()

    const text = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")

    if (!text) {
      return NextResponse.json({ error: "No response from AI", raw: data }, { status: 500 })
    }

    const start = text.indexOf("{")
    const end   = text.lastIndexOf("}")
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "No JSON in response", raw: text.slice(0, 500) }, { status: 500 })
    }

    let parsed: any
    try {
      parsed = JSON.parse(text.slice(start, end + 1))
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw: text.slice(0, 500) }, { status: 500 })
    }

    if (!parsed.findings || !Array.isArray(parsed.findings)) {
      return NextResponse.json({ error: "Missing findings array in response" }, { status: 500 })
    }

    return NextResponse.json({ success: true, findings: parsed.findings, summary: parsed.summary ?? "" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
