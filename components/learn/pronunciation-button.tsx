"use client";

import { useState } from "react";

export function PronunciationButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.84;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return <button type="button" onClick={speak} aria-label={`${label}: ${text}`} aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-primary transition hover:border-primary/40 hover:bg-[#f4f7f1]"><span aria-hidden="true">{speaking ? "◖)))" : "◖))"}</span>{speaking ? "Playing" : label}</button>;
}
