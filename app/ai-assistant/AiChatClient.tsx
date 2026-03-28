
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Country {
  iso2: string;
  name: string;
}

interface Props {
  countries: Country[];
  userId: string | null;
  isPro: boolean;
  monthlyUsage: number;
  freeAnonLimit: number;
  freeUserLimit: number;
}

const ANON_KEY = "gpe_ai_anon_count";

function getAnonCount(): number {
  try { return parseInt(localStorage.getItem(ANON_KEY) || "0", 10); } catch { return 0; }
}
function incrementAnonCount(): number {
  try {
    const next = getAnonCount() + 1;
    localStorage.setItem(ANON_KEY, String(next));
    return next;
  } catch { return 99; }
}

function SignUpPrompt() {
  return (
    <div className="border border-blue-500/30 bg-blue-600/10 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <h3 className="text-white font-bold text-xl mb-2">You have used your 5 free questions</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
        Create a free account to continue. Free accounts get 10 AI questions per month —
        no payment required. Upgrade to Pro anytime for unlimited access.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/sign-up/" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Create free account
        </a>
        <a href="/sign-in/" className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Sign in
        </a>
      </div>
      <p className="text-slate-600 text-xs mt-4">No credit card required</p>
    </div>
  );
}

function UpgradePrompt() {
  return (
    <div className="border border-blue-500/30 bg-slate-900 rounded-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold">Upgrade to PayrollExpert Pro</div>
            <div className="text-slate-400 text-sm">You have used your 10 free questions this month</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            "Unlimited AI questions",
            "Save unlimited calculations",
            "Full PDF exports",
            "Termination rules — all countries",
            "Contractor classification rules",
            "Double taxation treaty data",
            "Remote work PE rules",
            "Rate-change email alerts",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
              <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/pricing/" className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">
            Upgrade to Pro — £29/mo
          </a>
          <a href="/pricing/" className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
            £249/yr — save £99
          </a>
        </div>
        <p className="text-slate-600 text-xs mt-3 text-center">Cancel anytime. EU VAT handled automatically.</p>
      </div>
    </div>
  );
}

export default function AiChatClient({ countries, userId, isPro, monthlyUsage, freeAnonLimit, freeUserLimit }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am PayrollExpert AI. Ask me anything about payroll, employment law, tax, social security, and HR compliance for any country in the world. Select a country below for data-backed answers.",
    },
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [anonCount, setAnonCount]     = useState(0);
  const [showLimit, setShowLimit]     = useState<"anon" | "free" | null>(null);
  const bottomRef                      = useRef<HTMLDivElement>(null);
  const textareaRef                    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setAnonCount(getAnonCount());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showLimit]);

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setCountryCode(code);
    const found = countries.find((c) => c.iso2 === code);
    setCountryName(found ? found.name : "");
  }

  function checkLimit(): "anon" | "free" | null {
    if (isPro) return null;
    if (!userId && anonCount >= freeAnonLimit) return "anon";
    if (userId && !isPro && monthlyUsage >= freeUserLimit) return "free";
    return null;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const limit = checkLimit();
    if (limit) { setShowLimit(limit); return; }

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (!userId) {
      const newCount = incrementAnonCount();
      setAnonCount(newCount);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(userId ? { "x-user-id": userId } : {}) },
        body: JSON.stringify({
          message: text,
          countryCode: countryCode || null,
          countryName: countryName || null,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      const newAnonCount = !userId ? getAnonCount() : anonCount;
      const newMonthly   = userId && !isPro ? monthlyUsage + 1 : monthlyUsage;
      if (!userId && newAnonCount >= freeAnonLimit) setShowLimit("anon");
      if (userId && !isPro && newMonthly >= freeUserLimit) setShowLimit("free");

    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const questionsLeft = isPro ? null : !userId ? Math.max(0, freeAnonLimit - anonCount) : Math.max(0, freeUserLimit - monthlyUsage);

  const SUGGESTIONS = countryCode
    ? ["What are the income tax brackets?", "What is the employer social security rate?", "What is the minimum wage?", "How many days annual leave are employees entitled to?"]
    : ["Compare employer costs in Germany vs UK", "What are the payroll obligations in France?", "How does social security work in Singapore?", "What notice period is required in the Netherlands?"];

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">PayrollExpert AI</div>
              <div className="text-slate-500 text-xs">Global payroll intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {questionsLeft !== null && (
              <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-3 py-1">
                {questionsLeft} question{questionsLeft !== 1 ? "s" : ""} left
              </span>
            )}
            <select value={countryCode} onChange={handleCountryChange}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 max-w-[180px]">
              <option value="">All countries</option>
              {countries.map((c) => <option key={c.iso2} value={c.iso2}>{c.name}</option>)}
            </select>
            {!userId && (
              <a href="/sign-in/" className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors">Sign in</a>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"}`}>
              {msg.content}
              {msg.role === "assistant" && msg.content === "" && (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
                </span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && !showLimit && (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                className="text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl px-4 py-3.5 text-slate-300 text-sm transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {showLimit === "anon" && <SignUpPrompt />}
        {showLimit === "free" && <UpgradePrompt />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {countryName && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500">Context:</span>
              <span className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full">
                {countryName}
                <button onClick={() => { setCountryCode(""); setCountryName(""); }} className="hover:text-white transition-colors">x</button>
              </span>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={showLimit ? "Create an account or upgrade to continue..." : countryName ? `Ask about ${countryName} payroll...` : "Ask about payroll, employment law, tax, or HR compliance..."}
              disabled={!!showLimit}
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ minHeight: "52px", maxHeight: "160px" }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading || !!showLimit}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3.5 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          {!userId && !showLimit && (
            <p className="text-slate-600 text-xs mt-3 text-center">
              {freeAnonLimit - anonCount} free question{freeAnonLimit - anonCount !== 1 ? "s" : ""} remaining.
              <a href="/sign-up/" className="text-blue-500 hover:text-blue-400 ml-1">Create a free account</a> for 10 per month.
            </p>
          )}
          {userId && !isPro && !showLimit && (
            <p className="text-slate-600 text-xs mt-3 text-center">
              {freeUserLimit - monthlyUsage} question{freeUserLimit - monthlyUsage !== 1 ? "s" : ""} remaining this month.
              <a href="/pricing/" className="text-blue-500 hover:text-blue-400 ml-1">Upgrade to Pro</a> for unlimited access.
            </p>
          )}
          {!showLimit && (
            <p className="text-slate-600 text-xs mt-2 text-center">PayrollExpert AI can make mistakes. Always verify with official sources.</p>
          )}
        </div>
      </div>
    </main>
  );
}
