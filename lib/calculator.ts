// lib/calculator.ts
// Core payroll calculation engine for GlobalPayrollExpert
// All calculation logic lives here — no UI dependencies

export interface TaxBracket {
  bracket_order: number
  lower_limit: number
  upper_limit: number | null
  rate: number
  bracket_name: string
}

export interface SocialSecurityRate {
  contribution_type: string // 'employee' | 'employer'
  rate_percent: number
  cap_amount: number | null
  description: string
}

export interface BracketBreakdown {
  bracket_name: string
  rate: number
  taxable_amount: number
  tax_due: number
}

export interface SSBreakdown {
  description: string
  rate: number
  contribution: number
}

export interface CalculationResult {
  // Annual figures
  gross_annual: number
  income_tax_annual: number
  employee_ss_annual: number
  net_annual: number
  employer_ss_annual: number
  total_employer_cost_annual: number

  // Monthly figures
  gross_monthly: number
  income_tax_monthly: number
  employee_ss_monthly: number
  net_monthly: number
  employer_ss_monthly: number
  total_employer_cost_monthly: number

  // Rates
  effective_tax_rate: number
  effective_total_deduction_rate: number

  // Itemised breakdowns
  tax_bracket_breakdown: BracketBreakdown[]
  employee_ss_breakdown: SSBreakdown[]
  employer_ss_breakdown: SSBreakdown[]

  // Meta
  currency_code: string
  tax_year: number
}

/**
 * Calculate income tax using progressive brackets.
 * Returns total tax and a per-bracket breakdown.
 */
export function calculateIncomeTax(
  annualGross: number,
  brackets: TaxBracket[]
): { total: number; breakdown: BracketBreakdown[] } {
  if (!brackets || brackets.length === 0) {
    return { total: 0, breakdown: [] }
  }

  const sorted = [...brackets].sort((a, b) => a.bracket_order - b.bracket_order)
  let remaining = annualGross
  let totalTax = 0
  const breakdown: BracketBreakdown[] = []

  for (const bracket of sorted) {
    if (remaining <= 0) break

    const bandTop = bracket.upper_limit ?? Infinity
    const bandBottom = bracket.lower_limit
    const bandWidth = bandTop - bandBottom
    const taxableInBand = Math.min(remaining, Math.max(0, annualGross - bandBottom), bandWidth)

    if (taxableInBand <= 0) continue

    const taxInBand = taxableInBand * (bracket.rate / 100)
    totalTax += taxInBand
    remaining -= taxableInBand

    breakdown.push({
      bracket_name: bracket.bracket_name,
      rate: bracket.rate,
      taxable_amount: taxableInBand,
      tax_due: taxInBand,
    })
  }

  return { total: totalTax, breakdown }
}

/**
 * Calculate social security contributions (employee or employer).
 * Applies rate to gross salary, respecting any annual cap.
 */
export function calculateSocialSecurity(
  annualGross: number,
  rates: SocialSecurityRate[],
  type: 'employee' | 'employer'
): { total: number; breakdown: SSBreakdown[] } {
  const filtered = rates.filter((r) => r.contribution_type === type)

  if (!filtered || filtered.length === 0) {
    return { total: 0, breakdown: [] }
  }

  let total = 0
  const breakdown: SSBreakdown[] = []

  for (const rate of filtered) {
    const base = rate.cap_amount ? Math.min(annualGross, rate.cap_amount) : annualGross
    const contribution = base * (rate.rate_percent / 100)
    total += contribution

    breakdown.push({
      description: rate.description,
      rate: rate.rate_percent,
      contribution,
    })
  }

  return { total, breakdown }
}

/**
 * Master calculation function.
 * Takes gross salary (in the period specified), tax brackets, and SS rates.
 * Returns a complete CalculationResult.
 */
export function calculatePayroll(
  grossInput: number,
  period: 'monthly' | 'annual',
  brackets: TaxBracket[],
  ssRates: SocialSecurityRate[],
  currencyCode: string,
  taxYear: number
): CalculationResult {
  const annualGross = period === 'monthly' ? grossInput * 12 : grossInput

  const { total: incomeTaxAnnual, breakdown: taxBreakdown } = calculateIncomeTax(
    annualGross,
    brackets
  )

  const { total: employeeSsAnnual, breakdown: employeeSsBreakdown } = calculateSocialSecurity(
    annualGross,
    ssRates,
    'employee'
  )

  const { total: employerSsAnnual, breakdown: employerSsBreakdown } = calculateSocialSecurity(
    annualGross,
    ssRates,
    'employer'
  )

  const netAnnual = annualGross - incomeTaxAnnual - employeeSsAnnual
  const totalEmployerCostAnnual = annualGross + employerSsAnnual

  const effectiveTaxRate = annualGross > 0 ? (incomeTaxAnnual / annualGross) * 100 : 0
  const totalDeductions = incomeTaxAnnual + employeeSsAnnual
  const effectiveTotalDeductionRate = annualGross > 0 ? (totalDeductions / annualGross) * 100 : 0

  return {
    gross_annual: annualGross,
    income_tax_annual: incomeTaxAnnual,
    employee_ss_annual: employeeSsAnnual,
    net_annual: netAnnual,
    employer_ss_annual: employerSsAnnual,
    total_employer_cost_annual: totalEmployerCostAnnual,

    gross_monthly: annualGross / 12,
    income_tax_monthly: incomeTaxAnnual / 12,
    employee_ss_monthly: employeeSsAnnual / 12,
    net_monthly: netAnnual / 12,
    employer_ss_monthly: employerSsAnnual / 12,
    total_employer_cost_monthly: totalEmployerCostAnnual / 12,

    effective_tax_rate: effectiveTaxRate,
    effective_total_deduction_rate: effectiveTotalDeductionRate,

    tax_bracket_breakdown: taxBreakdown,
    employee_ss_breakdown: employeeSsBreakdown,
    employer_ss_breakdown: employerSsBreakdown,

    currency_code: currencyCode,
    tax_year: taxYear,
  }
}
