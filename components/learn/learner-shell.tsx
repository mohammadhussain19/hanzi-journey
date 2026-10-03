import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";
import { LearnerNav } from "@/components/learn/learner-nav";
import { logoutAction } from "@/lib/auth/actions";

export function LearnerShell({ children, name, email }: { children: React.ReactNode; name: string | null; email: string }) {
  const initial = (name || email).slice(0, 1).toUpperCase();
  return (
    <div className="min-h-screen bg-[#f7f6f0]">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-7">
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-4"><span className="hidden rounded-full bg-[#f6ead1] px-3 py-1.5 text-xs font-bold text-[#8a5b18] sm:inline-flex">✦ &nbsp;HSK 1</span><Link href="/profile" className="flex items-center gap-2 rounded-full border border-border bg-white p-1 pr-3 text-left hover:border-primary/30"><span className="grid size-8 place-items-center rounded-full bg-[#dce8dc] text-xs font-bold text-primary">{initial}</span><span className="hidden max-w-28 truncate text-xs font-semibold sm:inline">{name || email.split("@")[0]}</span></Link></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[232px] shrink-0 flex-col border-r border-border/70 bg-[#f7f6f0] px-4 py-7 lg:flex">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[.16em] text-muted-foreground uppercase">Your learning space</p>
          <LearnerNav />
          <div className="mt-auto rounded-2xl border border-[#dce4d9] bg-[#edf2eb] p-4"><span className="text-lg" aria-hidden="true">☘</span><p className="mt-2 text-sm font-semibold">Little by little</p><p className="mt-1 text-xs leading-5 text-muted-foreground">A few minutes today makes tomorrow easier.</p><form action={logoutAction} className="mt-3"><button className="text-xs font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">Log out</button></form></div>
        </aside>
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
      </div>
    </div>
  );
}
