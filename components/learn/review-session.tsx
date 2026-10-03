"use client";

import { useState, useTransition } from "react";
import { reviewVocabularyAction } from "@/lib/progress/actions";
import { PronunciationButton } from "@/components/learn/pronunciation-button";
import type { VocabularyItem } from "@/types/learning";

export function ReviewSession({ items }: { items: Array<{ progressId: string; vocabularyId: string; word: VocabularyItem }> }) {
  const [remaining, setRemaining] = useState(items);
  const [completed, setCompleted] = useState(0);
  const [xp, setXp] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = remaining[0];

  function answer(correct: boolean) {
    if (!current) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await reviewVocabularyAction(current.vocabularyId, correct);
        if (!response.ok) setMessage("This word was already reviewed in another tab. Your progress is up to date.");
        setXp((total) => total + response.xpAwarded);
        setRemaining((list) => list.slice(1));
        setCompleted((count) => count + 1);
      } catch {
        setMessage("We couldn’t save that review. Please check your connection and try again.");
      }
    });
  }

  if (!current) return <section className="rounded-[1.5rem] border border-[#dce4d9] bg-[#eef3eb] px-6 py-10 text-center sm:px-10"><span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-2xl text-primary">✓</span><p className="mt-4 text-xs font-bold tracking-[.15em] text-primary uppercase">Review complete</p><h2 className="mt-2 text-2xl font-semibold">You made space for what matters.</h2><p className="mt-2 text-sm text-muted-foreground">{completed} {completed === 1 ? "word" : "words"} revisited · {xp} XP earned</p><p className="mt-4 text-xs text-muted-foreground">You’re all caught up for now 🎉</p></section>;

  const progress = items.length ? Math.min(100, Math.round((completed / items.length) * 100)) : 0;
  return <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">Daily review · {completed + 1} of {items.length}</p><h2 className="mt-1 text-lg font-semibold">Give this word another look.</h2></div><span className="text-xs font-bold text-primary">+{xp} XP</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8e9e1]" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={completed} aria-label="Review progress"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${progress}%`}}/></div><div className="mt-7 rounded-3xl bg-[#f2f1eb] px-5 py-9 text-center"><p lang="zh" className="hanzi-font text-6xl tracking-[.07em] sm:text-7xl">{current.word.hanzi}</p><p className="mt-3 text-lg tracking-wide text-primary">{current.word.pinyin}</p><div className="mt-4"><PronunciationButton text={current.word.hanzi}/></div><p className="mt-5 text-xl font-semibold">{current.word.meaning}</p><div className="mt-5 border-t border-border/80 pt-4"><p lang="zh" className="hanzi-font text-sm">{current.word.example}</p><p className="mt-1 text-xs text-muted-foreground">{current.word.examplePinyin}</p><p className="mt-1 text-xs text-muted-foreground">{current.word.exampleMeaning}</p></div></div>{message && <p role="status" className="mt-4 rounded-xl border border-[#edd4ae] bg-[#fbf4e7] px-4 py-3 text-sm text-[#775829]">{message}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" disabled={pending} onClick={()=>answer(false)} className="rounded-xl border border-border px-4 py-3.5 text-sm font-semibold hover:bg-muted disabled:opacity-60">Need another pass</button><button type="button" disabled={pending} onClick={()=>answer(true)} className="rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white hover:bg-[#1c4b38] disabled:opacity-60">I remembered it ✓</button></div></section>;
}
