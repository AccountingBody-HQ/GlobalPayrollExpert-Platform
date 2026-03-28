"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  countryCode: string;
  countryName: string;
  isPro: boolean;
}

export default function AiCountryWidget({ countryCode, countryName, isPro }: Props) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer]   = useState("");

  async function ask() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          countryCode,
          countryName,
          history: [],
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let text2 = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text2 += decoder.decode(value, { stream: true });
        setAnswer(text2);
      }
    } catch {
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isPro) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm">Ask PayrollExpert AI</div>
            <div className="text-slate-500 text-xs">About {countryName} payroll</div>
          </div>
          <span className="ml-auto text-xs font-bold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2.5 py-1 rounded-full">Pro</span>
        </div>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          Get instant AI-powered answers about {countryName} payroll, tax, and employment law.
        </p>
        <Link
          href="/pricing/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <div className="text-white font-bold text-sm">Ask PayrollExpert AI</div>
          <div className="text-slate-400 text-xs">Ask anything about {countryName} payroll</div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-5">
          {answer && (
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 mb-4 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder={`Ask about ${countryName} payroll...`}
              className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
            <button
              onClick={ask}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors shrink-0"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-slate-600 text-xs">Always verify with official sources.</p>
            <Link href="/ai-assistant/" className="text-blue-500 hover:text-blue-400 text-xs transition-colors">
              Full AI chat →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
