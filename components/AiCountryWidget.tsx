
"use client";

import Link from "next/link";

interface Props {
  countryCode: string;
  countryName: string;
  isPro: boolean;
}

export default function AiCountryWidget({ countryCode, countryName }: Props) {
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
          <div className="text-white font-bold text-sm">Ask HRLake AI</div>
          <div className="text-slate-500 text-xs">About {countryName} employment and HR</div>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
        Get instant AI-powered answers about {countryName} employment law, payroll, tax, and EOR.
      </p>
      <Link
        href={`/ai-assistant/?country=${countryCode.toLowerCase()}`}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
      >
        Ask HRLake AI
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </Link>
    </div>
  );
}
