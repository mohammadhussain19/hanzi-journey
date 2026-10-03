import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return <AuthCard><p className="text-xs font-bold tracking-[.18em] text-accent uppercase">Your next chapter</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Let’s get you started.</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Create a free account and begin with HSK 1.</p><div className="mt-8"><RegisterForm /></div><div className="mt-7 rounded-xl bg-[#eef1e9] px-4 py-3 text-xs leading-5 text-muted-foreground"><span className="font-bold text-primary">Your account, your progress.</span> Lesson scores and saved vocabulary stay associated with your account.</div></AuthCard>;
}
