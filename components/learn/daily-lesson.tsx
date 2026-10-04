"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PronunciationButton } from "@/components/learn/pronunciation-button";
import { completeLessonAction, saveLessonSectionAction, type SavedLessonResult } from "@/lib/progress/actions";
import type { Exercise, ExerciseAnswer, LessonContent, LessonSectionId } from "@/types/learning";

const sections: Array<{ id: LessonSectionId; title: string }> = [
  { id: "listening", title: "Listening" }, { id: "reading", title: "Reading" }, { id: "vocabulary", title: "Vocabulary" }, { id: "practice", title: "Practice" },
];
type PublicExercise = Omit<Exercise, "correctAnswer" | "explanation">;
type DailyLessonData = Omit<LessonContent, "listening" | "reading" | "practiceExercises"> & { dayNumber: number; objective: string; reading: Omit<NonNullable<LessonContent["reading"]>, "questions"> & { questions: PublicExercise[] }; listening: Omit<NonNullable<LessonContent["listening"]>, "exercises"> & { exercises: PublicExercise[] }; practiceExercises: PublicExercise[] };

export function DailyLesson({ lesson, completedSections, nextLessonId }: { lesson: DailyLessonData; completedSections: string[]; nextLessonId?: string }) {
  const [answers, setAnswers] = useState<ExerciseAnswer[]>([]);
  const [active, setActive] = useState<LessonSectionId>(sections.find((section) => !completedSections.includes(section.id))?.id ?? "listening");
  const [result, setResult] = useState<SavedLessonResult | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const questionsForSection = (id: LessonSectionId) => id === "listening" ? lesson.listening.exercises : id === "reading" ? lesson.reading.questions : id === "practice" ? lesson.practiceExercises : [];
  const [selected, setSelected] = useState<Record<string, string>>({});

  function finishSection() {
    const items = questionsForSection(active);
    if (items.some((item) => !selected[item.id])) { setError("Answer each question in this section first."); return; }
    const additions = items.map((item) => ({ id: item.id, answer: selected[item.id] }));
    const nextAnswers = [...answers.filter((answer) => !additions.some((item) => item.id === answer.id)), ...additions];
    setAnswers(nextAnswers);
    setError("");
    startTransition(async () => {
      try {
        await saveLessonSectionAction(lesson.id, active);
        const next = sections[sections.findIndex((section) => section.id === active) + 1];
        if (next) setActive(next.id);
        else setResult(await completeLessonAction({ lessonId: lesson.id, answers: nextAnswers }));
      } catch { setError("We couldn’t save this section. Check your connection and try again."); }
    });
  }

  if (result) return <section className="mt-7 rounded-3xl border border-[#dce4d9] bg-white p-6 text-center sm:p-10"><p className="text-xs font-bold tracking-[.16em] text-primary uppercase">Day {lesson.dayNumber} complete</p><h2 className="mt-3 text-3xl font-semibold">{result.accuracy >= 80 ? "Great work." : "Good practice."}</h2><p className="mt-3 text-muted-foreground">{result.correctCount} of {result.totalQuestions} correct · {result.accuracy}% accuracy · +{result.xpAwarded} XP</p><p className="mt-2 text-sm text-muted-foreground">Your score and vocabulary review schedule have been saved.</p>{result.mistakes.length > 0 && <div className="mt-6 space-y-2 text-left"><h3 className="text-sm font-bold">Review these answers</h3>{result.mistakes.map((mistake) => <div key={`${mistake.question}-${mistake.prompt}`} className="rounded-xl border border-[#efcfc4] bg-[#fcf1ec] p-3 text-sm"><p className="font-semibold">{mistake.question}</p><p className="mt-1 text-muted-foreground">Your answer: {mistake.submitted} · Correct: <strong className="text-foreground">{mistake.answer}</strong></p><p className="mt-1 text-xs text-muted-foreground">{mistake.explanation}</p></div>)}</div>}<div className="mt-6 flex flex-wrap justify-center gap-3">{result.mistakes.length > 0 && <button onClick={() => { setResult(null); setAnswers([]); setSelected({}); setActive("listening"); setError(""); }} className="rounded-xl border border-primary px-5 py-3 text-sm font-bold text-primary">Retry this day</button>}<Link className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white" href={nextLessonId ? `/lesson/${nextLessonId}` : "/course"}>{nextLessonId ? "Continue to tomorrow" : "Course map"} →</Link><Link className="rounded-xl border px-5 py-3 text-sm font-semibold" href="/dashboard">Dashboard</Link></div></section>;

  const activeIndex = sections.findIndex((section) => section.id === active);
  const items = questionsForSection(active);
  return <div className="mt-7">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Lesson sections">{sections.map((section, index) => <div key={section.id} className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${index === activeIndex ? "border-primary bg-[#eaf0e8] text-primary" : completedSections.includes(section.id) ? "border-[#cfdfcf] bg-[#f4f8f2]" : "border-border bg-white text-muted-foreground"}`}><span className="mr-1">{completedSections.includes(section.id) ? "✓" : `${index + 1}.`}</span>{section.title}</div>)}</div>
    {active === "listening" && <section className="mt-5 rounded-3xl border border-border bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Listen closely</h2><p className="mt-1 text-sm text-muted-foreground">Hear today&apos;s words and a short passage read aloud.</p><div className="mt-5 flex flex-wrap gap-3">{lesson.listening.items.map((item) => <div key={item.text} className="flex items-center gap-3 rounded-2xl bg-[#f6f6f0] px-4 py-3"><div><p lang="zh" className="hanzi-font text-2xl">{item.text}</p><p className="text-xs text-muted-foreground">{item.pinyin} · {item.meaning}</p></div><PronunciationButton text={item.text}/></div>)}</div>{lesson.listening.sentences?.map((item) => <div key={item.text} className="mt-5 rounded-2xl border p-4"><p lang="zh" className="hanzi-font text-xl">{item.text}</p><p className="mt-1 text-sm text-muted-foreground">{item.pinyin}</p><p className="mt-1 text-sm">{item.meaning}</p><PronunciationButton className="mt-3" text={item.text} label="Listen to the passage"/></div>)}</section>}
    {active === "reading" && <section className="mt-5 rounded-3xl border border-border bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Read for meaning</h2><p lang="zh" className="hanzi-font mt-5 text-2xl leading-[2] sm:text-3xl">{lesson.reading.text}</p><p className="mt-3 leading-7 text-primary">{lesson.reading.pinyin}</p><details className="mt-4 rounded-xl bg-[#f6f6f0] p-4"><summary className="cursor-pointer text-sm font-semibold">Show English translation</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.reading.translation}</p></details><PronunciationButton className="mt-4" text={lesson.reading.text} label="Listen while you read"/></section>}
    {active === "vocabulary" && <section className="mt-5 rounded-3xl border border-border bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Today&apos;s useful words</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map((word) => <article key={word.id} className="rounded-2xl border bg-[#fffefa] p-4"><div className="flex items-start justify-between gap-3"><div><p lang="zh" className="hanzi-font text-3xl">{word.hanzi}</p><p className="mt-1 text-sm font-medium text-primary">{word.pinyin}</p><p className="mt-1 text-sm text-muted-foreground">{word.meaning}</p></div><PronunciationButton text={word.hanzi}/></div><div className="mt-3 border-t pt-3"><p lang="zh" className="hanzi-font text-sm">{word.example}</p><p className="mt-1 text-xs text-muted-foreground">{word.examplePinyin}</p><p className="mt-1 text-xs">{word.exampleMeaning}</p><PronunciationButton className="mt-2" text={word.example} label="Listen to example"/></div></article>)}</div></section>}
    {active === "practice" && <section className="mt-5 rounded-3xl border border-border bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Practice what you learned</h2><p className="mt-1 text-sm text-muted-foreground">Choose an answer for each question. Your final score is checked and saved securely.</p></section>}
    {items.map((item) => <Question key={item.id} exercise={item} selected={selected[item.id] ?? ""} onSelect={(answer) => setSelected((current) => ({ ...current, [item.id]: answer }))}/>)}
    {error && <p role="alert" className="mt-4 rounded-xl border border-[#efc9bd] bg-[#fbefea] p-3 text-sm text-[#8c3b27]">{error}</p>}
    <div className="mt-5 flex justify-end"><button disabled={pending} onClick={finishSection} className="rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving…" : active === "practice" ? "Finish day and see score" : `Complete ${sections[activeIndex].title}`} →</button></div>
  </div>;
}

function Question({ exercise, selected, onSelect }: { exercise: PublicExercise; selected: string; onSelect: (answer: string) => void }) {
  return <section className="mt-4 rounded-2xl border border-border bg-white p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-bold">{exercise.question}</h3>{exercise.listenText && <PronunciationButton text={exercise.listenText} label="Play audio"/>}</div><p lang="zh" className={`mt-3 ${/[\u3400-\u9fff]/.test(exercise.prompt) ? "hanzi-font text-xl" : "text-sm text-muted-foreground"}`}>{exercise.prompt}</p><fieldset className="mt-3 grid gap-2 sm:grid-cols-2"><legend className="sr-only">Answer choices</legend>{exercise.options.map((option) => <button key={option} type="button" aria-pressed={selected === option} onClick={() => onSelect(option)} className={`rounded-xl border p-3 text-left text-sm font-medium transition focus-visible:outline-offset-2 ${selected === option ? "border-primary bg-[#eaf0e8] text-primary" : "border-border hover:bg-[#f6f6f0]"}`}>{option}</button>)}</fieldset></section>;
}

