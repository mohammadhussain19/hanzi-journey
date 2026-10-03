import type { LessonCompletionResult } from "@/types/learning";

export interface ExistingLessonProgress {
  completed: boolean;
  xpEarned: number;
}

export function buildLessonProgressWrite(userId: string, lessonId: string, result: LessonCompletionResult, existing: ExistingLessonProgress | null, completedAt: Date) {
  const xpAwarded = existing?.completed ? 0 : result.xpEarned;
  return {
    xpAwarded,
    create: {
      userId,
      lessonId,
      completed: true,
      score: result.correctCount,
      accuracy: result.accuracy,
      xpEarned: xpAwarded,
      completedAt,
    },
    update: {
      completed: true,
      score: result.correctCount,
      accuracy: result.accuracy,
      xpEarned: { increment: xpAwarded },
      completedAt,
    },
  };
}
