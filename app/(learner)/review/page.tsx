import Link from "next/link";
import { ReviewSession } from "@/components/learn/review-session";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { getAllVocabulary } from "@/lib/lessons/content";

export const metadata = { title: "Review words" };

export default async function ReviewPage() {
  const user = await requireUser("/review");
  const rows = await prisma.vocabularyProgress.findMany({ where: { userId: user.id, nextReviewAt: { lte: new Date() } }, orderBy: { nextReviewAt: "asc" }, take: 50, select: { id: true, vocabularyId: true } });
  const byId = new Map(getAllVocabulary().map((word) => [word.id, word]));
  const items = rows.flatMap((row) => {const word=byId.get(row.vocabularyId); return word ? [{progressId:row.id,vocabularyId:row.vocabularyId,word}] : [];});

  return <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10"><div className="mb-7"><p className="text-xs font-bold tracking-[.15em] text-accent uppercase">Make it stick</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">A little review goes a long way.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Words you found tricky come back after a gentle pause. Recall first, then check the example and sound.</p></div>{items.length ? <ReviewSession items={items}/> : <section className="rounded-[1.5rem] border border-[#dce4d9] bg-[#eef3eb] px-6 py-12 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-2xl text-primary">✓</span><h2 className="mt-4 text-xl font-semibold">You’ve finished today’s review 🎉</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">There are no words due right now. Finish a lesson and we’ll add new words to your review schedule.</p><Link href="/course" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#1c4b38]">Explore a lesson →</Link></section>}<div className="mt-5 rounded-xl border border-border bg-white px-4 py-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">How review works:</strong> Correct answers return in 1, 3, 7, 14, and then 30 days. A missed word comes back tomorrow.</div></main>;
}
