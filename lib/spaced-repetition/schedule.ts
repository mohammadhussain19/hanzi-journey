import type { VocabularyDifficulty } from "../../generated/prisma/enums";

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

export interface ReviewState {
  correctCount: number;
  incorrectCount: number;
  difficulty: VocabularyDifficulty;
}

export interface ReviewResult {
  correctCount: number;
  incorrectCount: number;
  difficulty: VocabularyDifficulty;
  lastReviewed: Date;
  nextReviewAt: Date;
  intervalDays: number;
}

export function scheduleNextReview(state: ReviewState, correct: boolean, reviewedAt = new Date()): ReviewResult {
  if (Number.isNaN(reviewedAt.getTime())) throw new RangeError("Review date is invalid.");
  const correctCount = state.correctCount + Number(correct);
  const incorrectCount = state.incorrectCount + Number(!correct);
  const intervalIndex = correct ? Math.min(state.correctCount, REVIEW_INTERVAL_DAYS.length - 1) : 0;
  const intervalDays = REVIEW_INTERVAL_DAYS[intervalIndex];
  const nextReviewAt = new Date(reviewedAt);
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + intervalDays);
  const difficulty: VocabularyDifficulty = !correct
    ? "LEARNING"
    : correctCount >= 5
      ? "MASTERED"
      : correctCount >= 2
        ? "REVIEW"
        : "LEARNING";
  return { correctCount, incorrectCount, difficulty, lastReviewed: reviewedAt, nextReviewAt, intervalDays };
}
