"use client";

export default function LearningError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#fbefea] text-xl text-accent">!</span><h1 className="mt-5 text-2xl font-semibold">We couldn’t load your learning space.</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Something went wrong. Please try again.</p><button onClick={reset} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#1c4b38]">Try again</button></main>;
}
