import { SettingsForm } from "@/components/learn/settings-form";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true, email: true, currentLevel: true, dailyGoalMinutes: true, createdAt: true } });
  return <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10"><p className="text-xs font-bold tracking-[.16em] text-accent uppercase">Make it yours</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Adjust your learning details and daily rhythm.</p><section className="mt-7 rounded-[1.5rem] border border-border bg-card p-5 sm:p-7"><h2 className="text-lg font-semibold">Learning preferences</h2><p className="mt-1 text-sm text-muted-foreground">Your current course: {account.currentLevel}</p><div className="mt-6"><SettingsForm name={account.name??""} dailyGoalMinutes={account.dailyGoalMinutes}/></div></section><section className="mt-5 rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Account</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold text-muted-foreground">Email address</dt><dd className="mt-1 text-sm font-medium">{account.email}</dd></div><div><dt className="text-xs font-semibold text-muted-foreground">Member since</dt><dd className="mt-1 text-sm font-medium">{account.createdAt.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</dd></div></dl><p className="mt-5 text-xs leading-5 text-muted-foreground">Password reset and account deletion can be added with the account recovery flow in a future release.</p></section></main>;
}
