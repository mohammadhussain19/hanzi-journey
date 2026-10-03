export default function LearningLoading() {
  return <main aria-label="Loading your learning space" className="mx-auto max-w-6xl animate-pulse px-5 py-10 sm:px-8"><div className="h-4 w-36 rounded bg-muted"/><div className="mt-4 h-10 w-80 max-w-full rounded bg-muted"/><div className="mt-8 h-60 rounded-[1.75rem] bg-muted"/><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="h-28 rounded-2xl bg-muted"/>)}</div></main>;
}
