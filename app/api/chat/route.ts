import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `You are PayrollExpert AI, the world's most knowledgeable global payroll assistant. You answer questions about payroll, employment law, tax, social security, and HR compliance for any country in the world.

When answering:
- Be specific and cite exact rates, thresholds, and rules where you know them
- Always recommend consulting a qualified professional for specific situations
- Always cite the official source (government tax authority, ministry of labour etc.)
- If you have country-specific data in your context, use it and reference it clearly
- Keep answers structured and professional — your users are HR directors, payroll professionals, lawyers, and finance teams
- If you do not know something with confidence, say so clearly`;

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { message, countryCode, countryName, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Generate embedding for the user message
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Vector search — find top 5 matching chunks
    const { data: chunks } = await supabase.rpc("match_gpe_embeddings", {
      query_embedding: queryEmbedding,
      match_count: 5,
      filter_country: countryCode || null,
    });

    // 3. Fetch live country data from Supabase if country context set
    let countryContext = "";
    if (countryCode) {
      const [taxRes, ssRes, rulesRes] = await Promise.all([
        supabase.schema("gpe").from("tax_brackets")
          .select("bracket_order,lower_limit,upper_limit,rate,bracket_name")
          .eq("country_code", countryCode).eq("is_current", true).eq("tier", "free")
          .order("bracket_order"),
        supabase.schema("gpe").from("social_security")
          .select("contribution_type,rate_percent,cap_amount,notes")
          .eq("country_code", countryCode).eq("is_current", true),
        supabase.schema("gpe").from("employment_rules")
          .select("minimum_wage,annual_leave_days,notice_period_days,probation_period_days")
          .eq("country_code", countryCode).eq("is_current", true).single(),
      ]);

      const taxBrackets = taxRes.data || [];
      const ss = ssRes.data || [];
      const rules = rulesRes.data;

      if (taxBrackets.length > 0 || ss.length > 0 || rules) {
        countryContext = `\n\nLIVE DATABASE DATA FOR ${countryName || countryCode}:\n`;
        if (taxBrackets.length > 0) {
          countryContext += "Income Tax Brackets:\n";
          taxBrackets.forEach((b: any) => {
            const upper = b.upper_limit ? `to ${b.upper_limit}` : "and above";
            countryContext += `  ${b.bracket_name || ""}: ${b.lower_limit} ${upper} @ ${b.rate}%\n`;
          });
        }
        if (ss.length > 0) {
          countryContext += "Social Security:\n";
          ss.forEach((s: any) => {
            countryContext += `  ${s.contribution_type}: ${s.rate_percent}%${s.cap_amount ? " (cap: " + s.cap_amount + ")" : ""}\n`;
          });
        }
        if (rules) {
          countryContext += "Employment Rules:\n";
          if (rules.minimum_wage) countryContext += `  Minimum wage: ${rules.minimum_wage}\n`;
          if (rules.annual_leave_days) countryContext += `  Annual leave: ${rules.annual_leave_days} days\n`;
          if (rules.notice_period_days) countryContext += `  Notice period: ${rules.notice_period_days} days\n`;
        }
      }
    }

    // 4. Build context from vector search
    let vectorContext = "";
    if (chunks && chunks.length > 0) {
      vectorContext = "\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n";
      chunks.forEach((c: any, i: number) => {
        vectorContext += `[${i + 1}] ${c.title}: ${c.content_chunk}\n`;
      });
    }

    // 5. Build messages array
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT + countryContext + vectorContext },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // 6. Stream response from GPT-4o-mini
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    // Save conversation record for usage tracking
    if (req.headers.get("x-user-id")) {
      const userId = req.headers.get("x-user-id");
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabaseAdmin.from("ai_conversations").insert({
        user_id: userId,
        platform: "gpe",
        session_id: crypto.randomUUID(),
        messages: [{ role: "user", content: message }],
        gpe_data_accessed: !!countryCode,
        gpe_tier_accessed: "free",
        country_codes_used: countryCode ? [countryCode] : [],
        token_count: message.split(" ").length,
      });
    }

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
