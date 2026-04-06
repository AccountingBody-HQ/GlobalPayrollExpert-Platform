# HRLake Scripts — Complete Operations Manual

> This is the permanent operating manual for all HRLake platform scripts.
> Every operational decision must be consistent with this document.
> Do not delete or move any script in this folder.

---

## Table of Contents

1. [Overview](#overview)
2. [Script: batch_publish.py](#script-batch_publishpy)
3. [How to Run — All Scenarios](#how-to-run--all-scenarios)
4. [Content Types Reference](#content-types-reference)
5. [Countries Reference](#countries-reference)
6. [Log File](#log-file)
7. [Platform Architecture](#platform-architecture)
8. [Environment Variables](#environment-variables)
9. [Admin Pages](#admin-pages)
10. [Page Templates Build Status](#page-templates-build-status)
11. [Remaining Build Tasks](#remaining-build-tasks)
12. [Supabase Data Summary](#supabase-data-summary)

---

## Overview

The HRLake platform has three layers:

| Layer | Technology | Status |
|---|---|---|
| Layer 1 — Intelligence Engine | Supabase | ✅ 100% Complete |
| Layer 2 — Content Factory | Sanity CMS | ⏳ Run batch_publish.py |
| Layer 3 — Static Frontend | Next.js / Vercel | 🔧 4 templates to build |

Total articles to generate: 20 countries × 8 content types = 160 articles

---

## Script: batch_publish.py

### Location
/workspaces/HRLake-Platform/scripts/batch_publish.py

### What it does
For each combination of country and content type, the script:
1. Calls POST /api/content-factory/generate to generate the article via Claude AI
2. Calls POST /api/content-factory/publish to publish the article to Sanity CMS
3. Writes the result (success or failure) to the log file
4. Waits 2 seconds before the next article to avoid rate limiting

### Estimated runtime
- Full batch (160 articles): ~55 minutes
- Per article: ~20 seconds average
- Do not close the terminal while it runs

### How to run (full batch)
python3 /workspaces/HRLake-Platform/scripts/batch_publish.py

---

## How to Run — All Scenarios

### Scenario 1: Run for ALL 20 countries
python3 scripts/batch_publish.py

### Scenario 2: Run for ONE country
Edit the countries list in batch_publish.py:

countries = [
  ("GB", "United Kingdom"),
]

Produces 8 articles. Run: python3 scripts/batch_publish.py

### Scenario 3: Run for TWO countries
countries = [
  ("DE", "Germany"),
  ("FR", "France"),
]

Produces 16 articles.

### Scenario 4: Run for TEN countries
countries = [
  ("GB", "United Kingdom"),
  ("US", "United States"),
  ("DE", "Germany"),
  ("FR", "France"),
  ("AU", "Australia"),
  ("IE", "Ireland"),
  ("NL", "Netherlands"),
  ("BE", "Belgium"),
  ("CA", "Canada"),
  ("DK", "Denmark"),
]

Produces 80 articles. Estimated time: ~28 minutes.

### Scenario 5: Run for a custom set of countries
Pick any combination from the Countries Reference table below.
Format: ("COUNTRY_CODE", "Country Name")

### Scenario 6: Run for ONE content type only
Edit the content_types list in batch_publish.py:

content_types = [
  ("Compliance Calendar", "monthly quarterly and annual employer compliance obligations filing deadlines and penalties"),
]

Produces 20 articles (one per country). Estimated time: ~7 minutes.
Combine with a reduced countries list to target any exact subset.

### Scenario 7: Skip already-published articles
Add entries to the skip set at the top of the script:

skip = {
  ("GB", "Country Report"),
  ("US", "Country Report"),
  ("DE", "Tax Guide"),
}

Format: ("COUNTRY_CODE", "Content Type Name") — both must match exactly.

### Scenario 8: Resume after a failure
1. Check what was already published:
   cat /workspaces/HRLake-Platform/scripts/batch_log.txt

2. Add all OK entries to the skip set in batch_publish.py

3. Rerun — it will skip completed articles and continue:
   python3 scripts/batch_publish.py

---

## Content Types Reference

| # | Content Type | Topic Coverage |
|---|---|---|
| 1 | Country Report | Employer obligations, employment law, payroll, tax framework, EOR |
| 2 | Tax Guide | Income tax, corporate tax, VAT, employer obligations, filing deadlines |
| 3 | EOR Guide | EOR structure, employment relationship, worker rights, payroll, transition |
| 4 | Payroll Guide | Payroll frequency, deductions, employer contributions, payslip requirements |
| 5 | Hiring Guide | Right to work, contracts, job advertising, background checks, onboarding |
| 6 | HR Compliance Guide | Contracts, working time, discrimination, data protection, health & safety |
| 7 | Leave and Benefits | Annual leave, public holidays, sick leave, maternity/paternity, benefits |
| 8 | Compliance Calendar | Monthly/quarterly/annual filing deadlines and penalties |

---

## Countries Reference

| Code | Country |
|---|---|
| GB | United Kingdom |
| US | United States |
| DE | Germany |
| FR | France |
| AU | Australia |
| IE | Ireland |
| NL | Netherlands |
| BE | Belgium |
| CA | Canada |
| DK | Denmark |
| SE | Sweden |
| NO | Norway |
| IT | Italy |
| ES | Spain |
| PL | Poland |
| PT | Portugal |
| SG | Singapore |
| CH | Switzerland |
| JP | Japan |
| AE | United Arab Emirates |

Target expansion: 57 countries total (37 more in future phases).

---

## Log File

Location: /workspaces/HRLake-Platform/scripts/batch_log.txt

Format per line:
STATUS|ContentType|CountryCode|CountryName|SanityDocumentID|Slug

Example:
OK|Country Report|GB|United Kingdom|cUrpzeP2Pwh2S9Frf64BOf|united-kingdom-country-report
FAIL|Tax Guide|JP|Japan|HTTPError 504|

---

## Platform Architecture

### Layer 1 — Intelligence Engine (Supabase)
Project: hrlake-platform | Schema: hrlake
Status: 100% complete for all 20 active countries

### Layer 2 — Content Factory (Sanity CMS)
Project ID: 4rllejq1 | Dataset: production
Generate endpoint: /api/content-factory/generate
Publish endpoint: /api/content-factory/publish
Studio: accountingbody-website.vercel.app/studio

### Layer 3 — Static Frontend (Next.js)
Repository: AccountingBody-HQ/HRLake-Platform
Vercel project: hrlake-platform
Live URL: https://global-payroll-expert-platform.vercel.app
Custom domain: hrlake.com (pending DNS cutover)

---

## Environment Variables

| Variable | Status |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✅ Confirmed |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Confirmed |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Confirmed |
| NEXT_PUBLIC_SANITY_PROJECT_ID | ✅ Confirmed — 4rllejq1 |
| NEXT_PUBLIC_SANITY_DATASET | ✅ Confirmed — production |
| SANITY_WRITE_TOKEN | ✅ Confirmed |
| SANITY_API_READ_TOKEN | ✅ Confirmed |
| ANTHROPIC_API_KEY | ✅ Confirmed |
| RESEND_API_KEY | ✅ Confirmed |
| OPENAI_API_KEY | ❌ NOT SET — required for RAG embeddings |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | ⚠️ Dev key only — needs production |
| CLERK_SECRET_KEY | ⚠️ Dev key only — needs production |
| NEXT_PUBLIC_SENTRY_DSN | ❌ NOT SET — required before launch |
| LEMON_SQUEEZY_WEBHOOK_SECRET | ❌ NOT SET — required for payments |

---

## Admin Pages

| Page | URL | Status |
|---|---|---|
| Data Quality Dashboard | /admin/data-quality/ | ✅ Built |
| AI Content Factory | /admin/content-factory/ | ✅ Built |
| Coverage Map | /admin/coverage/ | ✅ Built |
| Admin Settings | /admin/settings/ | ✅ Built |
| Admin Login | /admin-login/ | ✅ Built |
| Country Builder / Engine | /admin/country-builder/ | 🔧 To Build |

---

## Page Templates Build Status

| Page | URL Pattern | Status |
|---|---|---|
| Country Overview | /countries/[code]/ | ✅ Built |
| Payroll Calculator | /countries/[code]/payroll-calculator/ | ✅ Built |
| Employment Law | /countries/[code]/employmentlaw/ | ✅ Built |
| Tax Guide | /countries/[code]/tax-guide/ | ✅ Built |
| Hiring Guide | /countries/[code]/hiring-guide/ | ✅ Built |
| EOR Guide | /eor/[country]/ | ✅ Built |
| Payroll Guide | /countries/[code]/payroll-guide/ | 🔧 To Build |
| HR Compliance Guide | /countries/[code]/hr-compliance/ | 🔧 To Build |
| Leave and Benefits | /countries/[code]/leave-benefits/ | 🔧 To Build |
| Compliance Calendar | /countries/[code]/compliance-calendar/ | 🔧 To Build |

---

## Remaining Build Tasks

1. ⏳ Run batch_publish.py — generate all 160 Sanity articles
2. 🔧 Build /countries/[code]/payroll-guide/ page template
3. 🔧 Build /countries/[code]/hr-compliance/ page template
4. 🔧 Build /countries/[code]/leave-benefits/ page template
5. 🔧 Build /countries/[code]/compliance-calendar/ page template
6. 🔧 Build /admin/country-builder/ admin page
7. ❌ Set OPENAI_API_KEY in Vercel for RAG embeddings
8. ❌ Set NEXT_PUBLIC_SENTRY_DSN in Vercel for error monitoring
9. ⚠️ Upgrade Clerk to production keys before DNS cutover
10. 🌍 Expand to remaining 36 countries (target: 57 total)

---

## Supabase Data Summary

As of 6 April 2026

| Table | Rows | Countries |
|---|---|---|
| tax_brackets | varies | 20 |
| social_security | varies | 20 |
| employment_rules | varies | 20 |
| filing_calendar | 91 | 20 |
| public_holidays | 215 | 20 |
| statutory_leave | 119 | 20 |
| working_hours | 20 | 20 |
| termination_rules | 20 | 20 |
| pension_schemes | 35 | 20 |
| payroll_compliance | 60 | 20 |
| data_sources | 47 | 20 |
| country_coverage | 20 | 20 |
| data_quality | 120 | 20 |

---

This document is the single source of truth for HRLake platform operations.
Build everything as if it will serve millions of users for decades. Because it will.
