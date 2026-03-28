import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AiChatClient from "./AiChatClient";

async function getUserPlan(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from("subscriptions").select("plan, status").eq("user_id", userId).eq("platform", "gpe").single();
  return data;
}

async function getCountries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from("countries").select("iso2, name").order("name");
  return data || [];
}

export default async function AiAssistantPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const [subscription, countries] = await Promise.all([getUserPlan(userId), getCountries()]);
  const isPro = subscription && ["pro","enterprise"].includes(subscription.plan) && ["active","trialling"].includes(subscription.status);
  if (!isPro) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-3">PayrollExpert AI</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">PayrollExpert AI is available on the Pro plan.</p>
          <a href="/pricing/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            Upgrade to Pro
          </a>
          <p className="text-slate-500 text-sm mt-4">From 29/mo</p>
        </div>
      </main>
    );
  }
  return <AiChatClient countries={countries} userId={userId} />;
}