import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#f0efe8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4"><BrandMark /><p className="max-w-xs text-xs leading-5 text-muted-foreground">Small steps. Clear tones. A little more Chinese every day.</p></div>
        <div className="flex flex-wrap gap-5 text-xs font-medium text-muted-foreground">
          <Link href="/course" className="hover:text-foreground">Explore lessons</Link>
          <Link href="/register" className="hover:text-foreground">Create account</Link>
          <a href="https://github.com/mohammadhussain19/hanzi-journey" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub ↗</a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-border/70 px-5 py-4 text-[11px] text-muted-foreground sm:px-8">© {new Date().getFullYear()} Hanzi Journey · Open learning, shared freely.</div>
    </footer>
  );
}
