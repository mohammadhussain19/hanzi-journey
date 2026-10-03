"use client";

import { PronunciationButton } from "@/components/learn/pronunciation-button";
import type { Exercise } from "@/types/learning";

export function ExerciseCard({ exercise, number, total, selected, answered, onSelect }: { exercise: Exercise; number: number; total: number; selected: string | null; answered: boolean; onSelect: (value: string) => void }) {
  const showPronunciation = exercise.type === "CHARACTER_TO_ENGLISH" || exercise.type === "FILL_IN_THE_BLANK";
  const optionLabel = exercise.type === "SENTENCE_TRANSLATION" ? "translation" : exercise.type.includes("ENGLISH") ? "character answer" : "answer option";
  return <section aria-labelledby="exercise-question" className="mx-auto w-full max-w-2xl">
    <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.15em] text-accent uppercase">Practice · {number} of {total}</span>{number === 1 && <span className="rounded-full bg-[#f7eddb] px-3 py-1.5 text-xs font-semibold text-[#8b611e]">+5 XP per correct answer</span>}</div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8e9e1]" role="progressbar" aria-label="Lesson exercise progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={number}><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(number / total) * 100}%` }} /></div>
    <h1 id="exercise-question" className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">{exercise.question}</h1>
    <div className="mt-6 flex min-h-36 flex-col items-center justify-center rounded-3xl border border-border bg-white px-5 py-7 text-center shadow-[0_12px_45px_-38px_#203d2b]">
      <p className={`hanzi-font ${exercise.prompt.length <= 5 && /[\u3400-\u9fff]/.test(exercise.prompt) ? "text-5xl sm:text-6xl" : "text-2xl sm:text-3xl"}`} lang={/[\u3400-\u9fff]/.test(exercise.prompt) ? "zh" : undefined}>{exercise.prompt}</p>
      {showPronunciation && <div className="mt-4"><PronunciationButton text={exercise.prompt.replaceAll("＿＿＿", "")}/></div>}
    </div>
    {exercise.type === "FILL_IN_THE_BLANK" ? <label className="mt-6 block text-sm font-semibold" htmlFor="fill-answer">Your answer<input id="fill-answer" type="text" maxLength={24} autoComplete="off" value={selected ?? ""} disabled={answered} onChange={(event) => onSelect(event.currentTarget.value.trim())} className="mt-2 block w-full rounded-xl border border-border bg-white px-4 py-3.5 text-base font-normal outline-none focus:border-primary disabled:bg-muted" placeholder="Type the missing characters" /></label> : <fieldset className="mt-6 grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Select a {optionLabel}</legend>
      {exercise.options.map((option, index) => {
        const isSelected = selected === option;
        const isCorrect = answered && option === exercise.correctAnswer;
        const isWrong = answered && isSelected && !isCorrect;
        return <button key={`${exercise.id}-${option}`} type="button" aria-pressed={isSelected} disabled={answered} onClick={() => onSelect(option)} className={`group relative min-h-16 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition focus-visible:outline-offset-2 disabled:cursor-default ${isCorrect ? "border-[#81a888] bg-[#eaf3e9] text-[#245c45]" : isWrong ? "border-[#d58b75] bg-[#fbefea] text-[#8c3b27]" : isSelected ? "border-primary bg-[#edf2eb] text-primary" : "border-border bg-card hover:border-primary/35 hover:bg-white"}`}><span aria-hidden="true" className="mr-3 inline-grid size-7 place-items-center rounded-lg bg-[#f0f0e9] text-[11px] text-muted-foreground group-disabled:bg-white">{String.fromCharCode(65 + index)}</span><span lang={/[\u3400-\u9fff]/.test(option) ? "zh" : undefined} className={/[\u3400-\u9fff]/.test(option) ? "hanzi-font text-lg" : ""}>{option}</span>{isCorrect && <span className="float-right text-xs font-bold">Correct</span>}{isWrong && <span className="float-right text-xs font-bold">Not quite</span>}</button>;
      })}
    </fieldset>}
    {answered && <div role="status" className={`mt-5 rounded-2xl border p-4 ${selected === exercise.correctAnswer ? "border-[#dce7d9] bg-[#f1f6ef]" : "border-[#efcfc4] bg-[#fcf1ec]"}`}><p className="text-sm font-bold">{selected === exercise.correctAnswer ? "Nicely done." : `The answer is ${exercise.correctAnswer}.`}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{exercise.explanation}</p></div>}
  </section>;
}
