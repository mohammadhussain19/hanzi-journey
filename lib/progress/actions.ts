"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getLessonById } from "@/lib/lessons/content";
import { buildLessonExercises, scoreLesson } from "@/lib/lessons/exercises";
import { updateStreak } from "@/lib/progress/streak";
import { buildLessonProgressWrite } from "@/lib/progress/persistence";
import { DAILY_REVIEW_XP } from "@/lib/progress/xp";
import { scheduleNextReview } from "@/lib/spaced-repetition/schedule";
import type { ExerciseAnswer, LessonCompletionInput, LessonCompletionResult, LessonSectionId } from "@/types/learning";

export interface SavedLessonResult extends LessonCompletionResult {
  xpAwarded: number;
  alreadyCompleted: boolean;
  mistakes: Array<{ question: string; prompt: string; answer: string; explanation: string; submitted: string }>;
}

function isExerciseAnswer(value: unknown): value is ExerciseAnswer {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.answer === "string";
}

export async function completeLessonAction(payload: LessonCompletionInput): Promise<SavedLessonResult> {
  const user = await requireUser("/dashboard");
  if (!payload || typeof payload.lessonId !== "string" || payload.lessonId.length > 120 || !Array.isArray(payload.answers) || payload.answers.length > 12 || !payload.answers.every(isExerciseAnswer)) {
    throw new Error("This lesson submission could not be verified. Please try again.");
  }
  const lesson = getLessonById(payload.lessonId);
  if (!lesson) throw new Error("This lesson is not available.");
  if (lesson.dayNumber) {
    const savedSections = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } }, select: { completedSections: true } });
    if (!["listening", "reading", "vocabulary", "practice"].every((section) => savedSections?.completedSections.includes(section))) throw new Error("Finish each lesson section before submitting the final score.");
  }
  const exercises = buildLessonExercises(lesson);
  const result = scoreLesson(exercises, payload);
  const now = new Date();

  const saved = await prisma.$transaction(async (tx) => {
    const [account, priorProgress] = await Promise.all([
      tx.user.findUnique({ where: { id: user.id }, select: { xp: true, currentStreak: true, longestStreak: true, lastActivityDate: true } }),
      tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }),
    ]);
    if (!account) throw new Error("Your account could not be found. Please sign in again.");
    const alreadyCompleted = priorProgress?.completed ?? false;
    const progressWrite = buildLessonProgressWrite(user.id, lesson.id, result, priorProgress, now);
    const xpAwarded = progressWrite.xpAwarded;
    const streak = updateStreak({ currentStreak: account.currentStreak, longestStreak: account.longestStreak, lastActivityDate: account.lastActivityDate }, now);

    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      create: progressWrite.create,
      update: progressWrite.update,
    });

    const submitted = new Map(payload.answers.map((answer) => [answer.id, answer.answer]));
    for (const exercise of exercises) {
      const correct = submitted.get(exercise.id) === exercise.correctAnswer;
      const previous = await tx.vocabularyProgress.findUnique({ where: { userId_vocabularyId: { userId: user.id, vocabularyId: exercise.vocabularyId } } });
      const scheduled = scheduleNextReview({ correctCount: previous?.correctCount ?? 0, incorrectCount: previous?.incorrectCount ?? 0, difficulty: previous?.difficulty ?? "NEW" }, correct, now);
      await tx.vocabularyProgress.upsert({
        where: { userId_vocabularyId: { userId: user.id, vocabularyId: exercise.vocabularyId } },
        create: { userId: user.id, vocabularyId: exercise.vocabularyId, correctCount: scheduled.correctCount, incorrectCount: scheduled.incorrectCount, difficulty: scheduled.difficulty, lastReviewed: scheduled.lastReviewed, nextReviewAt: scheduled.nextReviewAt },
        update: { correctCount: scheduled.correctCount, incorrectCount: scheduled.incorrectCount, difficulty: scheduled.difficulty, lastReviewed: scheduled.lastReviewed, nextReviewAt: scheduled.nextReviewAt },
      });
    }

    await tx.user.update({ where: { id: user.id }, data: { xp: { increment: xpAwarded }, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActivityDate: streak.lastActivityDate } });
    const [completedLessons, learnedWords, updatedAccount] = await Promise.all([
      tx.lessonProgress.count({ where: { userId: user.id, completed: true } }),
      tx.vocabularyProgress.count({ where: { userId: user.id, correctCount: { gt: 0 } } }),
      tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true, currentStreak: true } }),
    ]);
    const newlyEarned = [
      ...(completedLessons >= 1 ? [{ id: "first-lesson", name: "First Lesson", description: "Complete your first lesson." }] : []),
      ...(updatedAccount.xp >= 100 ? [{ id: "100-xp", name: "100 XP", description: "Earn 100 experience points." }] : []),
      ...(updatedAccount.currentStreak >= 7 ? [{ id: "7-day-streak", name: "7 Day Streak", description: "Practice on seven days in a row." }] : []),
      ...(learnedWords >= 50 ? [{ id: "50-words", name: "50 Words Learned", description: "Get a first correct answer on 50 words." }] : []),
      ...(learnedWords >= 100 ? [{ id: "100-words", name: "100 Words Learned", description: "Get a first correct answer on 100 words." }] : []),
      ...(result.perfect ? [{ id: "first-perfect", name: "First Perfect Lesson", description: "Complete a lesson with every answer correct." }] : []),
    ];
    for (const achievement of newlyEarned) {
      await tx.achievement.upsert({ where: { id: achievement.id }, create: achievement, update: {} });
      await tx.userAchievement.upsert({ where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } }, create: { userId: user.id, achievementId: achievement.id }, update: {} });
    }
    const answers = new Map(payload.answers.map((answer) => [answer.id, answer.answer]));
    const mistakes = exercises.filter((exercise) => answers.get(exercise.id) !== exercise.correctAnswer).map((exercise) => ({ question: exercise.question, prompt: exercise.prompt, answer: exercise.correctAnswer, explanation: exercise.explanation, submitted: answers.get(exercise.id) ?? "No answer" }));
    return { ...result, xpAwarded, alreadyCompleted, mistakes };
  });

  revalidatePath("/dashboard");
  revalidatePath("/course");
  revalidatePath("/profile");
  revalidatePath("/review");
  return saved;
}

export async function saveLessonSectionAction(lessonId: string, section: LessonSectionId): Promise<void> {
  const user = await requireUser(`/lesson/${lessonId}`);
  const lesson = getLessonById(lessonId);
  if (!lesson?.dayNumber || !["listening", "reading", "vocabulary", "practice"].includes(section)) throw new Error("This lesson section could not be verified.");
  const prior = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } }, select: { completedSections: true } });
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, completedSections: [section] },
    update: { completedSections: [...new Set([...(prior?.completedSections ?? []), section])] },
  });
  revalidatePath(`/lesson/${lessonId}`);
}

export async function updateLearningLevelAction(formData: FormData) {
  const user = await requireUser("/onboarding");
  const level = formData.get("level");
  if (level !== "HSK1") throw new Error("Only the HSK 1 starter path is available right now.");
  await prisma.user.update({ where: { id: user.id }, data: { currentLevel: "HSK1" } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function reviewVocabularyAction(vocabularyId: string, correct: boolean): Promise<{ ok: boolean; xpAwarded: number }> {
  const user = await requireUser("/review");
  if (typeof vocabularyId !== "string" || vocabularyId.length > 160 || typeof correct !== "boolean") throw new Error("This review could not be verified.");
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const result = await prisma.$transaction(async (tx) => {
    const progress = await tx.vocabularyProgress.findUnique({ where: { userId_vocabularyId: { userId: user.id, vocabularyId } } });
    if (!progress?.nextReviewAt || progress.nextReviewAt > now) return { ok: false, xpAwarded: 0 };
    const reviewedToday = await tx.reviewHistory.findFirst({ where: { userId: user.id, reviewedAt: { gte: dayStart } }, select: { id: true } });
    const xpAwarded = reviewedToday ? 0 : DAILY_REVIEW_XP;
    const scheduled = scheduleNextReview(progress, correct, now);
    await tx.vocabularyProgress.update({ where: { id: progress.id }, data: { correctCount: scheduled.correctCount, incorrectCount: scheduled.incorrectCount, difficulty: scheduled.difficulty, lastReviewed: scheduled.lastReviewed, nextReviewAt: scheduled.nextReviewAt } });
    await tx.reviewHistory.create({ data: { userId: user.id, vocabularyId, correct, reviewedAt: now } });
    const account = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { currentStreak: true, longestStreak: true, lastActivityDate: true } });
    const streak = updateStreak(account, now);
    await tx.user.update({ where: { id: user.id }, data: { xp: { increment: xpAwarded }, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActivityDate: streak.lastActivityDate } });
    return { ok: true, xpAwarded };
  });
  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath("/profile");
  return result;
}

export async function updateProfileAction(_state: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const user = await requireUser("/settings");
  const nameValue = formData.get("name");
  const goalValue = formData.get("dailyGoalMinutes");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const dailyGoalMinutes = typeof goalValue === "string" ? Number(goalValue) : NaN;
  if (name.length < 1 || name.length > 60) return { error: "Name must be between 1 and 60 characters." };
  if (![5, 10, 15, 20].includes(dailyGoalMinutes)) return { error: "Choose a daily goal from the list." };
  await prisma.user.update({ where: { id: user.id }, data: { name, dailyGoalMinutes } });
  revalidatePath("/settings");
  revalidatePath("/profile");
  return { success: true };
}

