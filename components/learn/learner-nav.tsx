"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Today", icon: "◷" },
  { href: "/course", label: "Learn", icon: "文" },
  { href: "/review", label: "Review", icon: "↻" },
  { href: "/profile", label: "Progress", icon: "⌁" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function LearnerNav() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Learning navigation" className="hidden w-full flex-col gap-1 lg:flex">
        {links.map((link) => {
          const active = pathname === link.href || (link.href === "/course" && pathname.startsWith("/lesson"));
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-[#e9efe8] text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span aria-hidden="true" className="grid size-7 place-items-center text-base">{link.icon}</span>{link.label}{link.href === "/review" && <span className="ml-auto size-2 rounded-full bg-accent" aria-label="Review words available" />}</Link>;
        })}
      </nav>
      <nav aria-label="Learning navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-24px_#283c2d] backdrop-blur lg:hidden">
        {links.map((link) => {
          const active = pathname === link.href || (link.href === "/course" && pathname.startsWith("/lesson"));
          return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}><span aria-hidden="true" className="text-lg leading-none">{link.icon}</span>{link.label}</Link>;
        })}
      </nav>
    </>
  );
}
