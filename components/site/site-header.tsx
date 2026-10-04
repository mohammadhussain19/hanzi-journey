import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <BrandMark />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a className="transition hover:text-foreground" href="#how-it-works">How it works</a>
          <a className="transition hover:text-foreground" href="#learning-path">Learning path</a>
          <a className="transition hover:text-foreground" href="#open-source">Open source</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-primary transition hover:bg-muted">Log in</Link>
          <Link href="/register" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">Start learning <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <nav aria-label="Page sections" className="flex gap-5 overflow-x-auto border-t border-border/60 px-5 py-2.5 text-xs font-medium text-muted-foreground md:hidden">
        <a className="shrink-0 hover:text-foreground" href="#how-it-works">How it works</a>
        <a className="shrink-0 hover:text-foreground" href="#learning-path">Learning path</a>
        <a className="shrink-0 hover:text-foreground" href="#open-source">Open source</a>
      </nav>
    </header>
  );
}

