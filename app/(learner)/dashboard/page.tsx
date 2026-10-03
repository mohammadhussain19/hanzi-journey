import Link from "next/link";
import { getAllVocabulary, HSK1_LESSONS } from "@/lib/lessons/content";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Today" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [account, progressRows, learnedWords, dueReviews] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true, currentStreak: true, longestStreak: true, dailyGoalMinutes: true, lastActivityDate: true } }),
    prisma.lessonProgress.findMany({ where: { userId: user.id, completed: true }, select: { lessonId: true } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, correctCount: { gt: 0 } } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, nextReviewAt: { lte: new Date() } } }),
  ]);
  const completed = new Set(progressRows.map((row) => row.lessonId));
  const nextLesson = HSK1_LESSONS.find((lesson) => !completed.has(lesson.id)) ?? HSK1_LESSONS.at(-1)!;
  const progress = Math.round((completed.size / HSK1_LESSONS.length) * 100);
  const greeting = user.name ? `Good to see you, ${user.name.split(" ")[0]}.` : "Welcome back.";

  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-accent uppercase">Your learning day</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{greeting}</h1><p className="mt-2 text-sm text-muted-foreground">Ready for one more small step in Mandarin?</p></div><Link href="/course" className="hidden rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:border-primary/40 sm:inline-flex">View course map <span className="ml-2">↗</span></Link></div>

    <section className="mt-8 grid gap-4 lg:grid-cols-[1.55fr_.85fr]">
      <article className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white sm:p-8"><div className="absolute -right-10 -bottom-20 size-64 rounded-full border-[34px] border-white/5" /><div className="relative"><div className="flex flex-wrap items-center justify-between gap-4"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-white/85 uppercase">HSK 1 · Unit {String(nextLesson.unitNumber).padStart(2,"0")}</span><span className="text-xs text-white/70">{completed.size} of {HSK1_LESSONS.length} lessons complete</span></div><p className="mt-7 text-xs font-semibold tracking-[.16em] text-white/60 uppercase">Continue your path</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{nextLesson.title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/75">{nextLesson.description}</p><div className="mt-6 flex flex-wrap items-center gap-4"><Link href={`/lesson/${nextLesson.id}`} className="inline-flex items-center gap-3 rounded-xl bg-[#fffefa] px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:-translate-y-0.5">Continue learning <span aria-hidden="true">→</span></Link><span className="text-xs font-semibold text-white/75">About 8–10 minutes</span></div><div className="mt-8 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#e8b65a]" style={{width:`${progress}%`}} /></div><span className="text-xs font-bold">{progress}%</span></div><p className="mt-2 text-[11px] text-white/65">HSK 1 path progress</p></div></article>
      <article className="flex flex-col justify-between rounded-[1.75rem] border border-[#e6dfcc] bg-[#f4eddf] p-6 sm:p-7"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.16em] text-[#96713d] uppercase">Daily rhythm</span><span className="text-2xl" aria-hidden="true">☀</span></div><div className="mt-5"><p className="text-5xl font-semibold tracking-tight">{account.currentStreak}<span className="ml-2 text-lg font-medium text-muted-foreground">days</span></p><p className="mt-2 text-sm text-muted-foreground">Current practice streak</p></div><div className="mt-6 flex items-center justify-between border-t border-[#e2d7c0] pt-4 text-xs"><span className="text-muted-foreground">Longest streak</span><strong>{account.longestStreak} days</strong></div></article>
    </section>

    <section aria-label="Learning statistics" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard mark="✦" label="Experience" value={account.xp.toLocaleString()} note="XP earned" tone="gold" />
      <StatCard mark="文" label="Words learned" value={learnedWords.toLocaleString()} note={`of ${getAllVocabulary().length} in this path`} tone="green" />
      <StatCard mark="✓" label="Lessons done" value={`${completed.size}/${HSK1_LESSONS.length}`} note="Keep your rhythm" tone="coral" />
      <StatCard mark="↻" label="Review due" value={dueReviews.toLocaleString()} note={dueReviews === 0 ? "All caught up today" : "Words ready to revisit"} tone="green" />
    </section>

    <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <article className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.15em] text-muted-foreground uppercase">Up next on your path</p><h2 className="mt-2 text-xl font-semibold">{nextLesson.unitTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{HSK1_LESSONS.filter((lesson) => lesson.unitId === nextLesson.unitId).length} short lessons · useful words for real moments</p></div><span lang="zh" className="hanzi-font text-3xl text-primary">学</span></div><div className="mt-5 flex flex-col gap-2">{HSK1_LESSONS.filter((lesson) => lesson.unitId === nextLesson.unitId).map((lesson) => {const isComplete=completed.has(lesson.id); const isCurrent=lesson.id===nextLesson.id; return <Link key={lesson.id} href={`/lesson/${lesson.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${isCurrent?"bg-[#edf2eb]":"hover:bg-muted/70"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${isComplete?"bg-primary text-white":isCurrent?"bg-white text-primary":"bg-[#eeeee7] text-muted-foreground"}`}>{isComplete?"✓":String(lesson.order).padStart(2,"0")}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{lesson.title}</span><span className="block truncate text-xs text-muted-foreground">{lesson.vocabulary.length} words · {isComplete?"Completed":isCurrent?"Ready when you are":"Coming up"}</span></span><span aria-hidden="true" className="text-muted-foreground">→</span></Link>})}</div></article>
      <article className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6"><p className="text-xs font-bold tracking-[.15em] text-muted-foreground uppercase">A small reminder</p><p lang="zh" className="hanzi-font mt-6 text-4xl tracking-[.06em]">慢慢来</p><p className="mt-2 text-sm font-semibold">Màn man lái · Take it slowly</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Learning a language is less about a perfect streak and more about coming back with curiosity.</p><div className="mt-6 rounded-xl bg-[#f4f2ea] px-4 py-3 text-xs leading-5 text-muted-foreground">Your daily goal is <strong className="text-foreground">{account.dailyGoalMinutes} minutes</strong>. A single lesson is a good place to start.</div><Link href="/review" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Review words {dueReviews > 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">{dueReviews} due</span>}</Link></article>
    </section>
  </main>;
}

function StatCard({ mark, label, value, note, tone }: { mark: string; label: string; value: string; note: string; tone: "gold" | "green" | "coral" }) {
  const colors = { gold: "bg-[#f7eddb] text-[#94651d]", green: "bg-[#e9f0e8] text-primary", coral: "bg-[#f7e9e2] text-accent" };
  return <article className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><span className={`grid size-8 place-items-center rounded-xl text-xs font-bold ${colors[tone]}`}>{mark}</span></div><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{note}</p></article>;
}
