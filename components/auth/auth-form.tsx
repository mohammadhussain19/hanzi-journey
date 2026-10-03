"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

function FormField({ id, label, type = "text", autoComplete, required = true, minLength }: { id: string; label: string; type?: string; autoComplete?: string; required?: boolean; minLength?: number }) {
  return <label htmlFor={id} className="block text-sm font-semibold">{label}<input id={id} name={id} type={type} required={required} minLength={minLength} autoComplete={autoComplete} className="mt-2.5 block w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-primary" /></label>;
}

export function LoginForm({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="space-y-5"><input type="hidden" name="callbackUrl" value={callbackUrl} /><FormField id="email" label="Email address" type="email" autoComplete="email" /><FormField id="password" label="Password" type="password" autoComplete="current-password" /><ErrorMessage message={state.error} /><button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c4b38] disabled:cursor-wait disabled:opacity-70">{pending ? "Signing you in…" : "Log in"}<span aria-hidden="true">→</span></button><p className="text-center text-xs leading-5 text-muted-foreground">New here? <Link className="font-bold text-primary underline underline-offset-4" href="/register">Create a free account</Link></p></form>;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return <form action={action} className="space-y-5"><FormField id="name" label="What should we call you?" autoComplete="name" /><FormField id="email" label="Email address" type="email" autoComplete="email" /><FormField id="password" label="Create a password" type="password" autoComplete="new-password" minLength={8} /><p className="-mt-3 text-xs text-muted-foreground">At least 8 characters. Your password is stored as a secure hash.</p><ErrorMessage message={state.error} /><button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c4b38] disabled:cursor-wait disabled:opacity-70">{pending ? "Creating your account…" : "Create account"}<span aria-hidden="true">→</span></button><p className="text-center text-xs leading-5 text-muted-foreground">Already have an account? <Link className="font-bold text-primary underline underline-offset-4" href="/login">Log in</Link></p></form>;
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl border border-[#efc9bd] bg-[#fbefea] px-4 py-3 text-sm text-[#8c3b27]">{message}</p>;
}
