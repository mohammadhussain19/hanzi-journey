import Link from "next/link";
import { notFound } from "next/navigation";
import { PronunciationButton } from "@/components/learn/pronunciation-button";
import { getLessonById, HSK1_LESSONS } from "@/lib/lessons/content";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();
  const user = await requireUser(`/lesson/${lessonId}`);
  const progress = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } }, select: { completed: true, accuracy: true } });
  const currentIndex = HSK1_LESSONS.findIndex((item) => item.id === lessonId);
  const nextLesson = HSK1_LESSONS[currentIndex + 1];

  return <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
    <Link href="/course" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"><span aria-hidden="true">←</span> Course map</Link>
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">Unit {String(lesson.unitNumber).padStart(2,"0")} · Lesson {String(lesson.order).padStart(2,"0")}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{lesson.description}</p></div><span className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">{lesson.vocabulary.length} words · 8–10 min</span></div>
    <section className="mt-7 rounded-[1.5rem] border border-[#dce4d9] bg-[#eaf0e8] p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-primary uppercase">Stage 1 · Learn the words</p><h2 className="mt-1 text-lg font-semibold">See it, hear it, use it.</h2></div><p className="max-w-xs text-xs leading-5 text-muted-foreground">Listen for the tones, then notice each word in a simple sentence.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map((word,index)=><article key={word.id} className="rounded-2xl border border-[#dce2d8] bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold tracking-[.12em] text-muted-foreground">WORD {String(index+1).padStart(2,"0")}</span><p lang="zh" className="hanzi-font mt-2 text-4xl tracking-[.04em]">{word.hanzi}</p><p className="mt-1 text-sm font-medium tracking-wide text-primary">{word.pinyin}</p><p className="mt-1 text-sm text-muted-foreground">{word.meaning}</p></div><PronunciationButton text={word.hanzi} label="Listen"/></div><div className="mt-4 border-t border-border pt-3"><p lang="zh" className="hanzi-font text-sm">{word.example}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{word.examplePinyin}</p><p className="mt-0.5 text-xs text-muted-foreground">{word.exampleMeaning}</p></div></article>)}</div></section>
    <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">Stage 2 · Practice</p><h2 className="mt-1 text-lg font-semibold">Ready to try these words?</h2><p className="mt-1 text-sm text-muted-foreground">A short mixed quiz checks what stuck and schedules what to revisit.</p>{progress?.completed && <p className="mt-2 text-xs font-semibold text-primary">Previously completed · latest accuracy {Math.round((progress.accuracy ?? 0) * 100) || progress.accuracy}%</p>}</div><Link href={`/lesson/${lesson.id}/practice`} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-[#1c4b38] sm:w-auto">{progress?.completed?"Practice again":"Start practice"} <span aria-hidden="true">→</span></Link></section>
    {nextLesson && <p className="mt-6 text-center text-xs text-muted-foreground">Next up: <span className="font-semibold text-foreground">{nextLesson.title}</span></p>}
  </main>;
}
