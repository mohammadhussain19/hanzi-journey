"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeLessonAction, type SavedLessonResult } from "@/lib/progress/actions";
import type { Exercise, ExerciseAnswer } from "@/types/learning";
import { ExerciseCard } from "@/components/learn/exercise-card";

export function LessonPractice({ lessonTitle, lessonId, nextLessonId, exercises }: { lessonTitle: string; lessonId: string; nextLessonId?: string; exercises: Exercise[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ExerciseAnswer[]>([]);
  const [result, setResult] = useState<SavedLessonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const exercise = exercises[index];
  const answered = selected !== null;

  function continuePractice() {
    if (!selected) return;
    const nextAnswers = [...answers, { id: exercise.id, answer: selected }];
    if (index < exercises.length - 1) {
      setAnswers(nextAnswers);
      setSelected(null);
      setIndex(index + 1);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const saved = await completeLessonAction({ lessonId, answers: nextAnswers });
        setAnswers(nextAnswers);
        setSelected(null);
        setResult(saved);
      } catch {
        setError("We couldn’t save this lesson just now. Check your connection and try again.");
      }
    });
  }

  if (result) {
    return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16"><section className="overflow-hidden rounded-[2rem] border border-[#d9e3d8] bg-white text-center shadow-[0_25px_70px_-50px_#1e3d2c]"><div className="bg-[#eaf1e8] px-6 py-10"><span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-2xl text-white">{result.perfect ? "✦" : "✓"}</span><p className="mt-5 text-xs font-bold tracking-[.16em] text-primary uppercase">Lesson complete</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{result.perfect ? "A perfect round." : "You made progress."}</h1><p className="mt-2 text-sm text-muted-foreground">{lessonTitle} · Your answers have been checked and saved.</p></div><div className="grid grid-cols-3 divide-x divide-border px-3 py-7"><SummaryStat value={`${result.accuracy}%`} label="Accuracy"/><SummaryStat value={`+${result.xpAwarded}`} label="XP earned"/><SummaryStat value={`${result.correctCount}/${result.totalQuestions}`} label="Correct"/></div><div className="px-6 pb-8"><p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{result.alreadyCompleted ? "You have completed this lesson before, so the new score is saved without awarding XP twice." : "The words you practiced have been added to your review schedule."}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href={nextLessonId ? `/lesson/${nextLessonId}` : "/course"} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#1c4b38]">{nextLessonId ? "Continue to next lesson" : "Back to course map"} →</Link><Link href="/dashboard" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">Today’s dashboard</Link></div></div></section></main>;
  }

  return <main className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10"><div className="mb-8 flex items-center justify-between gap-4"><button type="button" onClick={() => router.push(`/lesson/${lessonId}`)} className="rounded-lg px-2 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><span aria-hidden="true">←</span> Exit practice</button><div className="text-right"><p className="text-[10px] font-bold tracking-[.14em] text-muted-foreground uppercase">{lessonTitle}</p><p className="mt-1 text-xs font-semibold">Question {index + 1} of {exercises.length}</p></div></div><ExerciseCard exercise={exercise} number={index+1} total={exercises.length} selected={selected} answered={answered} onSelect={setSelected}/>{error && <p role="alert" className="mt-5 rounded-xl border border-[#efc9bd] bg-[#fbefea] px-4 py-3 text-sm text-[#8c3b27]">{error}</p>}<div className="mt-6 flex justify-end"><button type="button" onClick={continuePractice} disabled={!answered || pending} className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c4b38] disabled:cursor-not-allowed disabled:bg-[#aebcaf]">{pending ? "Saving your progress…" : index === exercises.length - 1 ? "Finish lesson" : "Check and continue"} <span aria-hidden="true">→</span></button></div></main>;
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return <div className="px-2 py-2"><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[11px] font-semibold text-muted-foreground">{label}</p></div>;
}
