"use client";

import { useEffect, useRef, useState } from "react";
import { speakMandarin, type SpeechStatus } from "@/lib/audio/speech";

export function PronunciationButton({
  text,
  label = "Listen",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const cancelRef = useRef<(() => void) | null>(null);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    cancelRef.current?.();
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
  }, []);

  function listen() {
    if (status === "loading" || status === "speaking") {
      cancelRef.current?.();
      setStatus("idle");
      return;
    }
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    cancelRef.current?.();
    cancelRef.current = speakMandarin(text, (nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus === "error") {
        errorTimeout.current = setTimeout(() => setStatus("idle"), 2800);
      }
    });
  }

  const message = status === "loading" ? "Loading voice" : status === "speaking" ? "Playing" : status === "error" ? "Audio unavailable" : label;
  const playing = status === "loading" || status === "speaking";

  return (
    <button
      type="button"
      onClick={listen}
      aria-label={status === "error" ? "Audio unavailable for " + text : message + ": " + text}
      aria-live="polite"
      aria-pressed={playing}
      className={className ?? "inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-primary transition hover:border-primary/40 hover:bg-[#f4f7f1]"}
    >
      <span aria-hidden="true">{status === "error" ? "!" : playing ? "◖)))" : "◖))"}</span>
      {message}
    </button>
  );
}

