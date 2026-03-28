#!/usr/bin/env python3
import os, json, time, sys, urllib.request, urllib.parse

OPENAI_API_KEY       = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL         = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SANITY_PROJECT_ID    = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID", "")
SANITY_DATASET       = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
CHUNK_SIZE           = 500

def check_config():
    missing = []
    if not OPENAI_API_KEY:       missing.append("OPENAI_API_KEY")
    if not SUPABASE_URL:         missing.append("NEXT_PUBLIC_SUPABASE_URL")
    if not SUPABASE_SERVICE_KEY: missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if not SANITY_PROJECT_ID:    missing.append("NEXT_PUBLIC_SANITY_PROJECT_ID")
    if missing:
        print("Missing: " + ", ".join(missing))
        sys.exit(1)
    print("OK: All environment variables found")

def http_get(url, headers=None):
    if headers is None: headers = {}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def http_post(url, data, headers=None):
    if headers is None: headers = {}
    body = json.dumps(data).encode()
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def get_embedding(text):
    text = text.strip().replace("\n", " ")[:8000]
    result = http_post(
        "https://api.openai.com/v1/embeddings",
        {"model": "text-embedding-3-small", "input": text},
        {"Authorization": "Bearer " + OPENAI_API_KEY}
    )
    return result["data"][0]["embedding"]

def supa_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": "Bearer " + SUPABASE_SERVICE_KEY,
        "Content-Profile": "gpe",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def clear_embeddings():
    url = SUPABASE_URL + "/rest/v1/embeddings?id=neq.00000000-0000-0000-0000-000000000000"
    req = urllib.request.Request(url, headers=supa_headers(), method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("Cleared existing embeddings")
    except Exception as e:
        print("Could not clear embeddings (may be empty): " + str(e))

def insert_embedding(record):
    url = SUPABASE_URL + "/rest/v1/embeddings"
    req = urllib.request.Request(
        url, data=json.dumps(record).encode(),
        headers=supa_headers(), method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status

def get_countries():
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": "Bearer " + SUPABASE_SERVICE_KEY
    }
    return http_get(
        SUPABASE_URL + "/rest/v1/countries?select=iso2,name,currency_code,region&order=name",
        headers
    )

def get_sanity_articles():
    query = urllib.parse.quote('*[_type == "post" && "globalpayrollexpert" in showOnSites]{title,slug,excerpt,body}')
    url = "https://" + SANITY_PROJECT_ID + ".api.sanity.io/v2024-01-01/data/query/" + SANITY_DATASET + "?query=" + query
    try:
        data = http_get(url)
        return data.get("result", [])
    except Exception as e:
        print("Could not fetch Sanity articles: " + str(e))
        return []

def extract_body(body):
    if not body: return ""
    parts = []
    for block in body:
        if isinstance(block, dict) and block.get("_type") == "block":
            for child in block.get("children", []):
                if isinstance(child, dict):
                    parts.append(child.get("text", ""))
    return " ".join(parts)

def chunk_text(text):
    words = text.split()
    chunks, current, length = [], [], 0
    for word in words:
        current.append(word)
        length += len(word) + 1
        if length >= CHUNK_SIZE:
            chunks.append(" ".join(current))
            current, length = [], 0
    if current:
        chunks.append(" ".join(current))
    return chunks

def main():
    print("GPE Content Indexing Script")
    print("=" * 40)
    check_config()
    clear_embeddings()
    total = 0

    print("\nFetching Sanity articles...")
    articles = get_sanity_articles()
    print("Found " + str(len(articles)) + " articles")
    for article in articles:
        title     = article.get("title", "Untitled")
        slug      = (article.get("slug") or {}).get("current", "")
        excerpt   = article.get("excerpt", "")
        body_text = extract_body(article.get("body", []))
        full      = (title + ". " + excerpt + " " + body_text).strip()
        chunks    = chunk_text(full) if full else [title + ". " + excerpt]
        for i, chunk in enumerate(chunks):
            try:
                emb = get_embedding(chunk)
                insert_embedding({
                    "sanity_document_id": slug,
                    "country_code": None,
                    "content_type": "article",
                    "title": title,
                    "content_chunk": chunk,
                    "embedding": emb,
                    "token_count": len(chunk.split())
                })
                total += 1
                print("  OK: " + title[:50] + " chunk " + str(i+1))
                time.sleep(0.1)
            except Exception as e:
                print("  FAIL: " + title[:40] + " - " + str(e))

    print("\nFetching countries from Supabase...")
    countries = get_countries()
    print("Found " + str(len(countries)) + " countries")
    for c in countries:
        code     = c.get("iso2", "")
        name     = c.get("name", "")
        currency = c.get("currency_code", "")
        region   = c.get("region", "")
        text     = (name + " payroll and employment information. Country code: " + code +
                    ". Currency: " + currency + ". Region: " + str(region) +
                    ". Visit /countries/" + code.lower() + "/ for full tax brackets, " +
                    "social security rates, employer costs, employment law, and payroll calculator.")
        try:
            emb = get_embedding(text)
            insert_embedding({
                "sanity_document_id": None,
                "country_code": code,
                "content_type": "country_summary",
                "title": name + " Payroll Guide",
                "content_chunk": text,
                "embedding": emb,
                "token_count": len(text.split())
            })
            total += 1
            print("  OK: " + name)
            time.sleep(0.05)
        except Exception as e:
            print("  FAIL: " + name + " - " + str(e))

    print("\nDone - " + str(total) + " chunks stored in gpe.embeddings")

if __name__ == "__main__":
    main()
