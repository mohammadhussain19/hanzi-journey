import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_1fr]">
    <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
      <div className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="relative"><BrandMark /></div>
      <div className="relative max-w-lg"><p className="text-xs font-bold tracking-[.2em] text-white/60 uppercase">A good place to begin</p><p lang="zh" className="hanzi-font mt-5 text-7xl tracking-[.08em]">慢慢来</p><h1 className="mt-5 text-3xl leading-tight font-semibold tracking-tight">Slowly is a pace.<br />Steadily is a practice.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Build a Mandarin habit around small lessons, clear examples, and the words you want to remember.</p></div>
      <div className="relative flex justify-between text-xs text-white/60"><span>Free to learn · Open to all</span><Link href="/" className="hover:text-white">Back to home ↗</Link></div>
    </section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><BrandMark /></div>{children}</div></section>
  </main>;
}
