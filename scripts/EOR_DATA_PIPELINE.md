# EOR Guide Data Pipeline — Process Document

## Overview
This document defines the standard process for creating and inserting EOR guide data
for new countries into the hrlake.eor_guides Supabase table.

## When to use this process
- When a new country is added to the platform (is_active = true in countries table)
- When an existing EOR guide needs to be updated with new tax year data
- When source data changes materially (e.g. SS rate changes, new legislation)

## Required data sources per country
Before inserting any EOR guide, verify each field against official government sources:

| Field | Source |
|-------|--------|
| ss_employer_rate / ss_employer_display | National social security authority website |
| income_tax_range | National tax authority website |
| provider_fee_low / provider_fee_high | Cross-reference 3+ EOR providers (Deel, Remote, Rippling) |
| risk_level | Based on: termination complexity + SS rate + collective agreement prevalence |
| hire_speed | Based on: entity registration time + typical EOR provider onboarding time |
| eor_maturity | Based on: number of active EOR providers operating in country |
| key_facts | Each fact must have a verified source |
| compliance_risks | Based on official employment law publications |

## Risk level criteria
- Low: Simple termination rules, clear SS structure, no mandatory collective agreements
- Medium: Moderate complexity in one or more areas
- High: Complex termination (severance/TFR), mandatory collective agreements, high SS burden

## EOR maturity criteria
- Mature: 5+ major providers active (e.g. GB, US, DE)
- Established: 3-4 major providers active
- Emerging: 1-2 providers, limited local expertise

## Hire speed criteria
- Fast: Employee can be onboarded within 1-2 weeks
- Medium: 2-4 weeks typical onboarding
- Slow: 4+ weeks due to local registration or bureaucracy

## Insert process

### Step 1 — Verify all data
Research each field against official sources listed above.
Document the source URL for each key figure.

### Step 2 — Prepare the insert script
Copy /workspaces/HRLake-Platform/scripts/eor_guide_template.py
Fill in all fields for the new country.
Set source_url to the primary official government source.

### Step 3 — Insert into Supabase
Run: python3 /tmp/your_insert_script.py
Verify output shows success for each country.

### Step 4 — Verify on live page
Check: /eor/[country_code]/
Confirm all sections render correctly:
- Hero badges (risk level, maturity, hire speed)
- Key facts grid
- Recommendation card with fee range
- EOR vs Direct comparison (all 4 sections)
- Compliance risks grid
- EOR Cost Estimator defaults to correct country

### Step 5 — Commit source documentation
Add a comment to the insert script with verification date and sources used.
Commit the script to /workspaces/HRLake-Platform/scripts/eor_inserts/

## Template script location
/workspaces/HRLake-Platform/scripts/eor_guide_template.py

## Fields reference (full schema)
{
  "country_code": "XX",           # ISO2 code, uppercase
  "tax_year": 2025,               # Current tax year
  "valid_from": "YYYY-MM-DD",     # Today date
  "is_current": true,
  "tier": "free",
  "eor_available": true,
  "eor_maturity": "",             # Mature / Established / Emerging
  "risk_level": "",               # Low / Medium / High
  "hire_speed": "",               # Fast / Medium / Slow
  "provider_fee_low": 0,          # Integer percentage
  "provider_fee_high": 0,         # Integer percentage
  "ss_employer_display": "",      # Display string e.g. "13.8%"
  "ss_employer_rate": 0.0,        # Float
  "income_tax_range": "",         # Display string e.g. "20-45%"
  "recommendation_title": "",     # Short title shown on card
  "recommendation_detail": "",    # Full paragraph recommendation
  "key_facts": [],                # Array of {label, value} objects (6 recommended)
  "eor_pros": [],                 # Array of strings (4-6 items)
  "eor_cons": [],                 # Array of strings (4 items)
  "direct_pros": [],              # Array of strings (4 items)
  "direct_cons": [],              # Array of strings (4 items)
  "compliance_risks": [],         # Array of {risk, detail, severity} objects (4 items)
  "source_url": ""                # Primary official government source URL
}

## Notes
- Never insert without source_url populated
- Always verify ss_employer_rate matches ss_employer_display
- compliance_risks severity must be exactly: "High", "Medium", or "Low" (case sensitive)
- eor_maturity must be exactly: "Mature", "Established", or "Emerging" (case sensitive)
- risk_level must be exactly: "Low", "Medium", or "High" (case sensitive)
- hire_speed must be exactly: "Fast", "Medium", or "Slow" (case sensitive)
