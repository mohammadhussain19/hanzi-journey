import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { LearnerShell } from "@/components/learn/learner-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { prisma } from "@/lib/db/prisma";
import { HSK1_DAYS, HSK1_UNITS, getAllVocabulary } from "@/lib/lessons/content";

export const metadata: Metadata = { title: "HSK 1 learning map" };

export default async function CoursePage() {
  const session = await auth();
  const completedIds = session?.user?.id
    ? new Set((await prisma.lessonProgress.findMany({ where: { userId: session.user.id, completed: true }, select: { lessonId: true } })).map((item) => item.lessonId))
    : new Set<string>();
  const doneCount = HSK1_DAYS.filter((lesson) => completedIds.has(lesson.id)).length;
  const content = <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
    <div className="overflow-hidden rounded-[1.75rem] border border-[#dce4d9] bg-[#eaf0e8] p-6 sm:p-9"><p className="text-xs font-bold tracking-[.16em] text-primary uppercase">Your learning map</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">HSK 1 · 30 day path</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">A steady beginner course through reading, listening, useful vocabulary, and practice.</p></div><div className="rounded-2xl border border-white bg-white/75 px-4 py-3"><p className="text-xs text-muted-foreground">Days completed</p><p className="mt-1 text-lg font-bold">{doneCount} <span className="text-xs font-medium text-muted-foreground">/ 30</span></p></div></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${Math.round(doneCount/30*100)}%`}}/></div></div>
    <div className="mt-8 space-y-7">{Array.from({ length: 5 }, (_, index) => HSK1_DAYS.slice(index * 6, index * 6 + 6)).map((days, partIndex) => <section key={partIndex} aria-labelledby={`part-${partIndex + 1}`} className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.17em] text-accent uppercase">Part {partIndex + 1} · Days {days[0].dayNumber}–{days.at(-1)?.dayNumber}</p><h2 id={`part-${partIndex + 1}`} className="mt-1 text-xl font-semibold">{days[0].unitTitle.replace(/^Part \d+: /, "")}</h2></div><span className="rounded-full bg-[#f0f0e9] px-3 py-1.5 text-xs font-semibold text-muted-foreground">{days.length} lessons</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{days.map((lesson) => {const completed=completedIds.has(lesson.id); const href=session?.user ? `/lesson/${lesson.id}` : `/login?callbackUrl=${encodeURIComponent(`/lesson/${lesson.id}`)}`; return <Link key={lesson.id} href={href} className={`group flex min-h-36 flex-col rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${completed?"border-[#cfdfcf] bg-[#f4f8f2]":"border-border bg-white hover:border-primary/35"}`}><div className="flex items-center justify-between"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${completed?"bg-primary text-white":"bg-[#f2f1eb] text-muted-foreground"}`}>{completed?"✓":String(lesson.dayNumber).padStart(2,"0")}</span><span className="text-[10px] font-semibold text-muted-foreground">4 sections</span></div><h3 className="mt-4 text-sm font-bold group-hover:text-primary">{lesson.title}</h3><p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{lesson.objective}</p><p className="mt-3 text-[11px] font-medium text-primary">{lesson.vocabulary.slice(0,3).map((word)=>word.hanzi).join(" · ")} →</p></Link>})}</div></section>)}</div>
    <details className="mt-8 rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer text-sm font-semibold">Browse the original topic lesson collection (15 lessons)</summary><div className="mt-5 space-y-7">{HSK1_UNITS.map((unit) => <section key={unit.id} aria-labelledby={`${unit.id}-title`}><h2 id={`${unit.id}-title`} className="text-lg font-semibold">{unit.title}</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{unit.lessons.map((lesson) => <Link key={lesson.id} href={session?.user ? `/lesson/${lesson.id}` : `/login?callbackUrl=${encodeURIComponent(`/lesson/${lesson.id}`)}`} className="rounded-xl border bg-white p-4 text-sm font-semibold hover:border-primary/40">{lesson.title}<p className="mt-2 text-xs font-normal text-muted-foreground">{lesson.description}</p></Link>)}</div></section>)}</div></details>
    <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">Community-authored beginner content. HSK is used to describe the learning level; this project is not affiliated with or endorsed by the official HSK organization.</p>
    <p className="mt-2 text-center text-[11px] text-muted-foreground">{getAllVocabulary().length} starter words · More levels can be added as new content sets.</p>
  </main>;
  if (session?.user?.id) return <LearnerShell name={session.user.name ?? null} email={session.user.email ?? "learner"}>{content}</LearnerShell>;
  return <><SiteHeader />{content}<SiteFooter /></>;
}

