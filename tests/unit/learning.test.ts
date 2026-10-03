import { describe, expect, it } from "vitest";
import { HSK1_LESSONS, HSK1_UNITS, getAllVocabulary } from "@/lib/lessons/content";
import { buildLessonExercises, scoreLesson } from "@/lib/lessons/exercises";
import { calculateLessonXp } from "@/lib/progress/xp";
import { updateStreak } from "@/lib/progress/streak";
import { buildLessonProgressWrite } from "@/lib/progress/persistence";
import { scheduleNextReview } from "@/lib/spaced-repetition/schedule";
import { getAuthenticationDecision, getLoginRedirect } from "@/lib/auth/access";

describe("HSK 1 content", () => {
  it("loads five units, fifteen lessons, and 120 beginner words", () => {
    expect(HSK1_UNITS).toHaveLength(5);
    expect(HSK1_LESSONS).toHaveLength(15);
    expect(getAllVocabulary()).toHaveLength(120);
    expect(HSK1_LESSONS.every((lesson) => lesson.vocabulary.length === 8)).toBe(true);
  });

  it("builds each supported exercise shape from lesson data", () => {
    const exercises = buildLessonExercises(HSK1_LESSONS[0]);
    expect(new Set(exercises.map((exercise) => exercise.type)).size).toBe(7);
    expect(exercises.every((exercise) => exercise.options.includes(exercise.correctAnswer))).toBe(true);
    expect(exercises.every((exercise) => exercise.options.length === 4)).toBe(true);
  });

  it("scores answers against the server-side answer key", () => {
    const exercises = buildLessonExercises(HSK1_LESSONS[0]);
    const perfect = scoreLesson(exercises, { lessonId: HSK1_LESSONS[0].id, answers: exercises.map(({ id, correctAnswer }) => ({ id, answer: correctAnswer })) });
    expect(perfect).toMatchObject({ correctCount: 8, totalQuestions: 8, accuracy: 100, xpEarned: 70, perfect: true });
    const missed = scoreLesson(exercises, { lessonId: HSK1_LESSONS[0].id, answers: [{ id: exercises[0].id, answer: "not an answer" }] });
    expect(missed).toMatchObject({ correctCount: 0, accuracy: 0, xpEarned: 20, perfect: false });
    expect(() => scoreLesson(exercises, { lessonId: "fake", answers: [{ id: "fake-q", answer: "1000 XP" }] })).toThrow(/Invalid lesson answers/);
  });
});

describe("XP and streaks", () => {
  it("applies lesson, answer, and perfect bonuses", () => {
    expect(calculateLessonXp(0, 8)).toBe(20);
    expect(calculateLessonXp(4, 8)).toBe(40);
    expect(calculateLessonXp(8, 8)).toBe(70);
    expect(() => calculateLessonXp(9, 8)).toThrow(RangeError);
  });

  it("increments consecutive days, preserves same-day activity, and resets after a gap", () => {
    const initial = { currentStreak: 3, longestStreak: 5, lastActivityDate: new Date("2026-10-01T10:00:00Z") };
    expect(updateStreak(initial, new Date("2026-10-02T08:00:00Z"))).toMatchObject({ currentStreak: 4, longestStreak: 5 });
    expect(updateStreak(initial, new Date("2026-10-01T20:00:00Z")).currentStreak).toBe(3);
    expect(updateStreak(initial, new Date("2026-10-04T08:00:00Z"))).toMatchObject({ currentStreak: 1, longestStreak: 5 });
  });
});

describe("review scheduling", () => {
  it("uses 1, 3, 7, 14, and 30 day intervals and retries missed words tomorrow", () => {
    const now = new Date("2026-10-03T12:00:00Z");
    expect(scheduleNextReview({ correctCount: 0, incorrectCount: 0, difficulty: "NEW" }, true, now).intervalDays).toBe(1);
    expect(scheduleNextReview({ correctCount: 1, incorrectCount: 0, difficulty: "LEARNING" }, true, now).intervalDays).toBe(3);
    expect(scheduleNextReview({ correctCount: 4, incorrectCount: 0, difficulty: "REVIEW" }, true, now).intervalDays).toBe(30);
    const missed = scheduleNextReview({ correctCount: 3, incorrectCount: 0, difficulty: "REVIEW" }, false, now);
    expect(missed).toMatchObject({ intervalDays: 1, correctCount: 3, incorrectCount: 1, difficulty: "LEARNING" });
  });
});

describe("authentication and progress persistence", () => {
  it("protects signed-out routes and sanitizes the return path", () => {
    expect(getAuthenticationDecision(undefined, "/review")).toEqual({ allowed: false, redirectTo: "/login?callbackUrl=%2Freview" });
    expect(getAuthenticationDecision("user-1", "/review")).toEqual({ allowed: true });
    expect(getLoginRedirect("//evil.example")).toBe("/login?callbackUrl=%2Fdashboard");
  });

  it("creates progress and avoids awarding lesson XP twice", () => {
    const result = { correctCount: 6, totalQuestions: 8, accuracy: 75, xpEarned: 50, perfect: false };
    const firstWrite = buildLessonProgressWrite("user-1", "lesson-1", result, null, new Date("2026-10-03T10:00:00Z"));
    const persisted = { ...firstWrite.create };
    expect(firstWrite.xpAwarded).toBe(50);
    expect(persisted.lessonId).toBe("lesson-1");
    const secondWrite = buildLessonProgressWrite("user-1", "lesson-1", { ...result, correctCount: 7, accuracy: 88, xpEarned: 55 }, { completed: true, xpEarned: 50 }, new Date("2026-10-04T10:00:00Z"));
    const updated = { ...persisted, score: secondWrite.update.score, accuracy: secondWrite.update.accuracy, xpEarned: persisted.xpEarned + secondWrite.update.xpEarned.increment };
    expect(updated).toMatchObject({ score: 7, accuracy: 88, xpEarned: 50 });
    expect(secondWrite.xpAwarded).toBe(0);
  });
});
