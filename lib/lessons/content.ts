import raw01 from "@/content/hsk1/unit-01/lesson-01.json";
import raw02 from "@/content/hsk1/unit-01/lesson-02.json";
import raw03 from "@/content/hsk1/unit-01/lesson-03.json";
import raw04 from "@/content/hsk1/unit-02/lesson-01.json";
import raw05 from "@/content/hsk1/unit-02/lesson-02.json";
import raw06 from "@/content/hsk1/unit-02/lesson-03.json";
import raw07 from "@/content/hsk1/unit-03/lesson-01.json";
import raw08 from "@/content/hsk1/unit-03/lesson-02.json";
import raw09 from "@/content/hsk1/unit-03/lesson-03.json";
import raw10 from "@/content/hsk1/unit-04/lesson-01.json";
import raw11 from "@/content/hsk1/unit-04/lesson-02.json";
import raw12 from "@/content/hsk1/unit-04/lesson-03.json";
import raw13 from "@/content/hsk1/unit-05/lesson-01.json";
import raw14 from "@/content/hsk1/unit-05/lesson-02.json";
import raw15 from "@/content/hsk1/unit-05/lesson-03.json";
import rawDailyCourse from "@/content/hsk1/course-30-day.json";
import type { Exercise, LessonContent, LessonUnit, VocabularyItem } from "@/types/learning";

const rawTopicLessons: unknown[] = [raw01, raw02, raw03, raw04, raw05, raw06, raw07, raw08, raw09, raw10, raw11, raw12, raw13, raw14, raw15];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseVocabulary(value: unknown, lessonId: string): VocabularyItem {
  if (!value || typeof value !== "object") throw new Error(`Invalid vocabulary item in ${lessonId}`);
  const item = value as Record<string, unknown>;
  const required = ["id", "hanzi", "pinyin", "meaning", "partOfSpeech", "example", "examplePinyin", "exampleMeaning"];
  if (required.some((field) => !isNonEmptyString(item[field]))) throw new Error(`Incomplete vocabulary item in ${lessonId}`);
  if (item.level !== "HSK1" && item.level !== "HSK2" && item.level !== "HSK3") throw new Error(`Unknown vocabulary level in ${lessonId}`);
  return item as unknown as VocabularyItem;
}

export function parseLesson(value: unknown): LessonContent {
  if (!value || typeof value !== "object") throw new Error("Invalid lesson content file");
  const lesson = value as Record<string, unknown>;
  for (const field of ["id", "unitId", "unitTitle", "title", "description"]) {
    if (!isNonEmptyString(lesson[field])) throw new Error(`Lesson is missing ${field}`);
  }
  if (lesson.level !== "HSK1" || !Number.isInteger(lesson.unitNumber) || !Number.isInteger(lesson.order)) throw new Error(`Invalid HSK 1 lesson metadata: ${String(lesson.id)}`);
  if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.length < 1 || lesson.vocabulary.length > 12) throw new Error(`Lesson ${String(lesson.id)} must have 1–12 vocabulary items`);
  const vocabulary = lesson.vocabulary.map((item) => parseVocabulary(item, String(lesson.id)));
  const ids = new Set(vocabulary.map((item) => item.id));
  if (ids.size !== vocabulary.length) throw new Error(`Duplicate vocabulary IDs in ${String(lesson.id)}`);
  if (lesson.dayNumber !== undefined) {
    if (!Number.isInteger(lesson.dayNumber) || (lesson.dayNumber as number) < 1 || (lesson.dayNumber as number) > 30) throw new Error(`Invalid day number in ${String(lesson.id)}`);
    if (!isNonEmptyString(lesson.objective)) throw new Error(`Daily lesson ${String(lesson.id)} is missing its objective`);
    const exerciseArrays = [
      (lesson.listening as { exercises?: unknown[] } | undefined)?.exercises,
      (lesson.reading as { questions?: unknown[] } | undefined)?.questions,
      lesson.practiceExercises as unknown[] | undefined,
    ];
    for (const exercises of exerciseArrays) {
      if (!Array.isArray(exercises) || exercises.length < 1) throw new Error(`Daily lesson ${String(lesson.id)} is missing required section exercises`);
      for (const exercise of exercises) parseExercise(exercise, String(lesson.id), ids);
    }
    const reading = lesson.reading as Record<string, unknown> | undefined;
    const listening = lesson.listening as Record<string, unknown> | undefined;
    if (!reading || !isNonEmptyString(reading.text) || !isNonEmptyString(reading.pinyin) || !isNonEmptyString(reading.translation)) throw new Error(`Daily lesson ${String(lesson.id)} has incomplete reading content`);
    if (!listening || !Array.isArray(listening.items) || listening.items.length < 1) throw new Error(`Daily lesson ${String(lesson.id)} has no listening words`);
  }
  return { ...lesson, vocabulary } as unknown as LessonContent;
}

function parseExercise(value: unknown, lessonId: string, vocabularyIds: Set<string>): Exercise {
  if (!value || typeof value !== "object") throw new Error(`Invalid exercise in ${lessonId}`);
  const exercise = value as Record<string, unknown>;
  if (!["id", "type", "question", "prompt", "correctAnswer", "explanation", "vocabularyId"].every((field) => isNonEmptyString(exercise[field]))) throw new Error(`Incomplete exercise in ${lessonId}`);
  if (!Array.isArray(exercise.options) || exercise.options.length < 2 || !exercise.options.every(isNonEmptyString)) throw new Error(`Exercise in ${lessonId} needs answer choices`);
  if (!vocabularyIds.has(exercise.vocabularyId as string)) throw new Error(`Exercise in ${lessonId} references missing vocabulary`);
  if (exercise.type !== "FILL_IN_THE_BLANK" && exercise.type !== "WORD_ORDER" && !exercise.options.includes(exercise.correctAnswer as string)) throw new Error(`Exercise in ${lessonId} is missing its answer choice`);
  return exercise as unknown as Exercise;
}

export const HSK1_TOPIC_LESSONS = rawTopicLessons.map(parseLesson);
export const HSK1_DAYS = (rawDailyCourse as unknown[]).map(parseLesson).sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
if (HSK1_DAYS.length !== 30 || HSK1_DAYS.some((lesson, index) => lesson.dayNumber !== index + 1)) throw new Error("The HSK 1 daily course must contain exactly days 1 through 30.");
export const HSK1_LESSONS = [...HSK1_TOPIC_LESSONS, ...HSK1_DAYS];

export const HSK1_UNITS: LessonUnit[] = Array.from(new Set(HSK1_TOPIC_LESSONS.map((lesson) => lesson.unitId))).map((unitId) => {
  const lessons = HSK1_TOPIC_LESSONS.filter((lesson) => lesson.unitId === unitId).sort((a, b) => a.order - b.order);
  return { id: unitId, order: lessons[0].unitNumber, title: lessons[0].unitTitle, lessons };
});

const lessonsById = new Map(HSK1_LESSONS.map((lesson) => [lesson.id, lesson]));

export function getLessonById(lessonId: string): LessonContent | undefined {
  return lessonsById.get(lessonId);
}

export function getAllVocabulary(): VocabularyItem[] {
  return [...new Map(HSK1_LESSONS.flatMap((lesson) => lesson.vocabulary).map((word) => [word.id, word])).values()];
}

