import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const safeCallback = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";
  return <AuthCard><p className="text-xs font-bold tracking-[.18em] text-accent uppercase">Welcome back</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Pick up where you left off.</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">A little Mandarin, whenever you’re ready.</p><div className="mt-8"><LoginForm callbackUrl={safeCallback} /></div><p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">By continuing, you agree to use this learning project respectfully.</p></AuthCard>;
}
