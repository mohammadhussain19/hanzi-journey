export const LESSON_COMPLETION_XP = 20;
export const CORRECT_ANSWER_XP = 5;
export const PERFECT_LESSON_BONUS_XP = 10;
export const DAILY_REVIEW_XP = 10;

export function calculateLessonXp(correctCount: number, totalQuestions: number): number {
  if (!Number.isInteger(correctCount) || !Number.isInteger(totalQuestions) || totalQuestions < 0 || correctCount < 0 || correctCount > totalQuestions) {
    throw new RangeError("Lesson score must be a valid count of correct answers.");
  }
  if (totalQuestions === 0) return 0;
  return LESSON_COMPLETION_XP + correctCount * CORRECT_ANSWER_XP + (correctCount === totalQuestions ? PERFECT_LESSON_BONUS_XP : 0);
}
