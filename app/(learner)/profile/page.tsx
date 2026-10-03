import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { HSK1_LESSONS } from "@/lib/lessons/content";

export const metadata = { title: "Your progress" };

const achievements = [
  { id: "first-lesson", name: "First Lesson", description: "Complete your first lesson.", symbol: "一" },
  { id: "100-xp", name: "100 XP", description: "Earn 100 experience points.", symbol: "✦" },
  { id: "7-day-streak", name: "7 Day Streak", description: "Practice on seven days in a row.", symbol: "☀" },
  { id: "50-words", name: "50 Words", description: "Get a correct answer on 50 words.", symbol: "文" },
  { id: "100-words", name: "100 Words", description: "Get a correct answer on 100 words.", symbol: "百" },
  { id: "first-perfect", name: "Perfect Lesson", description: "Complete a lesson with every answer correct.", symbol: "✓" },
];

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [account, lessonProgress, learnedCount, earned] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true, currentStreak: true, longestStreak: true, lastActivityDate: true, currentLevel: true, createdAt: true } }),
    prisma.lessonProgress.findMany({ where: { userId: user.id, completed: true }, select: { lessonId: true, accuracy: true, completedAt: true }, orderBy: { completedAt: "desc" } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, correctCount: { gt: 0 } } }),
    prisma.userAchievement.findMany({ where: { userId: user.id }, select: { achievementId: true, earnedAt: true } }),
  ]);
  const completed = new Set(lessonProgress.map((row) => row.lessonId));
  const earnedIds = new Set(earned.map((row) => row.achievementId));
  const lastActivity = account.lastActivityDate?.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) ?? "Not yet";
  const stats = [["Experience", `${account.xp} XP`], ["Current streak", `${account.currentStreak} days`], ["Longest streak", `${account.longestStreak} days`], ["Words learned", `${learnedCount} words`]];

  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-accent uppercase">A record of your practice</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your progress</h1><p className="mt-2 text-sm text-muted-foreground">You started learning on {account.createdAt.toLocaleDateString(undefined,{month:"long",year:"numeric"})}.</p></div><Link href="/settings" className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:border-primary/40">Account settings ↗</Link></div>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label,value])=><article key={label} className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></article>)}</section>
    <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><article className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">HSK 1</p><h2 className="mt-1 text-xl font-semibold">Learning path</h2></div><span className="text-sm font-bold text-primary">{Math.round(completed.size/HSK1_LESSONS.length*100)}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${Math.round(completed.size/HSK1_LESSONS.length*100)}%`}}/></div><div className="mt-5 flex items-center justify-between text-xs"><span className="text-muted-foreground">Lessons completed</span><strong>{completed.size} / {HSK1_LESSONS.length}</strong></div><div className="mt-5 flex flex-wrap gap-2">{HSK1_LESSONS.map((lesson)=>{const done=completed.has(lesson.id);return <span key={lesson.id} title={lesson.title} aria-label={`${lesson.title}: ${done?"complete":"not complete"}`} className={`grid size-8 place-items-center rounded-full text-[10px] font-bold ${done?"bg-primary text-white":"bg-[#eeeee7] text-muted-foreground"}`}>{done?"✓":lesson.order}</span>})}</div><p className="mt-6 text-[11px] text-muted-foreground">Last learning activity: {lastActivity}</p></article>
      <article className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">Things you’ve earned</p><h2 className="mt-1 text-xl font-semibold">Achievements</h2><div className="mt-5 grid grid-cols-2 gap-3">{achievements.map((item)=>{const unlocked=earnedIds.has(item.id);return <div key={item.id} className={`rounded-2xl border p-3 ${unlocked?"border-[#d8e4d6] bg-[#f3f7f1]":"border-border bg-[#faf9f5] opacity-60"}`}><span className={`grid size-8 place-items-center rounded-full text-sm font-bold ${unlocked?"bg-[#e3eee1] text-primary":"bg-muted text-muted-foreground"}`}>{item.symbol}</span><p className="mt-2 text-xs font-bold">{item.name}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{item.description}</p><p className="mt-1 text-[9px] font-semibold text-primary">{unlocked?"Earned":"Not yet"}</p></div>})}</div></article></section>
    <section className="mt-7 rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.15em] text-muted-foreground uppercase">Your recent learning</p><h2 className="mt-1 text-xl font-semibold">Completed lessons</h2></div><Link href="/course" className="text-xs font-bold text-primary hover:underline">Course map →</Link></div>{lessonProgress.length ? <div className="mt-4 divide-y divide-border">{lessonProgress.slice(0,6).map((row)=>{const lesson=HSK1_LESSONS.find((item)=>item.id===row.lessonId);return <div key={row.lessonId} className="flex items-center gap-3 py-3"><span className="grid size-8 place-items-center rounded-full bg-[#eaf0e8] text-xs text-primary">✓</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{lesson?.title??row.lessonId}</p><p className="text-[11px] text-muted-foreground">{row.completedAt?.toLocaleDateString()}</p></div><span className="text-xs font-bold text-primary">{Math.round(row.accuracy??0)}%</span></div>})}</div>:<div className="mt-5 rounded-xl bg-[#f5f4ee] p-5 text-center"><p className="text-sm font-semibold">Your first completed lesson will show up here.</p><Link href="/course" className="mt-3 inline-block text-xs font-bold text-primary hover:underline">Find a lesson →</Link></div>}</section>
  </main>;
}
