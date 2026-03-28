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

export default function AiChatClient({
  countries,
  userId,
}: {
  countries: Country[];
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm PayrollExpert AI. I can answer questions about payroll, employment law, tax, social security, and HR compliance for any country in the world. You can select a country context below to get data-backed answers, or ask me anything directly.",
    },
  ]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [countryCode, setCountryCode]   = useState("");
  const [countryName, setCountryName]   = useState("");
  const bottomRef                        = useRef<HTMLDivElement>(null);
  const textareaRef                      = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setCountryCode(code);
    const found = countries.find((c) => c.iso2 === code);
    setCountryName(found ? found.name : "");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          countryCode: countryCode || null,
          countryName: countryName || null,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

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
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const SUGGESTIONS = countryCode
    ? [
        "What are the income tax brackets?",
        "What is the employer social security rate?",
        "What is the minimum wage?",
        "How many days annual leave are employees entitled to?",
      ]
    : [
        "Compare employer costs in Germany vs UK",
        "What are the payroll obligations in France?",
        "How does social security work in Singapore?",
        "What notice period is required in the Netherlands?",
      ];

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">PayrollExpert AI</div>
              <div className="text-slate-500 text-xs">Global payroll intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={countryCode}
              onChange={handleCountryChange}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 max-w-[180px]"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.iso2} value={c.iso2}>{c.name}</option>
              ))}
            </select>
            <Link
              href="/dashboard/"
              className="text-slate-400 hover:text-white text-xs transition-colors"
            >
              Dashboard
            </Link>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
              }`}
            >
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

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                className="text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl px-4 py-3.5 text-slate-300 text-sm transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

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
                <button onClick={() => { setCountryCode(""); setCountryName(""); }} className="hover:text-white transition-colors">×</button>
              </span>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={countryName ? `Ask about ${countryName} payroll...` : "Ask about payroll, employment law, tax, or HR compliance..."}
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none transition-colors"
              style={{ minHeight: "52px", maxHeight: "160px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3.5 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-3 text-center">
            PayrollExpert AI can make mistakes. Always verify with official sources and consult a qualified professional.
          </p>
        </div>
      </div>
    </main>
  );
}
