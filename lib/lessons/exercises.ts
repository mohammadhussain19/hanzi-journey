import type { Exercise, ExerciseType, LessonCompletionResult, LessonContent, LessonCompletionInput } from "@/types/learning";
import { calculateLessonXp } from "@/lib/progress/xp";

const exerciseTypes: ExerciseType[] = [
  "CHARACTER_TO_ENGLISH",
  "ENGLISH_TO_CHARACTER",
  "CHARACTER_TO_PINYIN",
  "PINYIN_TO_CHARACTER",
  "SENTENCE_TRANSLATION",
  "FILL_IN_THE_BLANK",
  "MULTIPLE_CHOICE",
];

function choicesFor(answer: string, alternatives: string[]): string[] {
  const unique = [...new Set([answer, ...alternatives.filter((option) => option !== answer)])];
  return unique.slice(0, 4);
}

function choicesForWord(lesson: LessonContent, answer: string, field: "meaning" | "hanzi" | "pinyin" | "exampleMeaning"): string[] {
  return choicesFor(answer, lesson.vocabulary.map((word) => word[field]));
}

export function buildLessonExercises(lesson: LessonContent): Exercise[] {
  if (lesson.dayNumber !== undefined) {
    return [
      ...(lesson.listening?.exercises ?? []),
      ...(lesson.reading?.questions ?? []),
      ...(lesson.practiceExercises ?? []),
    ];
  }

  const vocabulary = lesson.vocabulary;
  return vocabulary.map((word, index) => {
    const type = exerciseTypes[index % exerciseTypes.length];
    const otherWords = vocabulary.filter((item) => item.id !== word.id);
    let question: string;
    let prompt: string;
    let answer: string;
    let options: string[];
    let explanation: string;
    switch (type) {
      case "CHARACTER_TO_ENGLISH":
        question = "What does this mean?";
        prompt = word.hanzi;
        answer = word.meaning;
        options = choicesForWord(lesson, answer, "meaning");
        explanation = `${word.hanzi} (${word.pinyin}) means “${word.meaning}.”`;
        break;
      case "ENGLISH_TO_CHARACTER":
        question = "Choose the Chinese characters.";
        prompt = word.meaning;
        answer = word.hanzi;
        options = choicesForWord(lesson, answer, "hanzi");
        explanation = `${word.meaning} is ${word.hanzi} (${word.pinyin}).`;
        break;
      case "CHARACTER_TO_PINYIN":
        question = "Which pinyin matches these characters?";
        prompt = word.hanzi;
        answer = word.pinyin;
        options = choicesForWord(lesson, answer, "pinyin");
        explanation = `${word.hanzi} is pronounced ${word.pinyin}.`;
        break;
      case "PINYIN_TO_CHARACTER":
        question = "Find the matching characters.";
        prompt = word.pinyin;
        answer = word.hanzi;
        options = choicesForWord(lesson, answer, "hanzi");
        explanation = `${word.pinyin} is written ${word.hanzi}.`;
        break;
      case "SENTENCE_TRANSLATION":
        question = "What does this sentence mean?";
        prompt = word.example;
        answer = word.exampleMeaning;
        options = choicesForWord(lesson, answer, "exampleMeaning");
        explanation = `${word.examplePinyin} — ${word.exampleMeaning}`;
        break;
      case "FILL_IN_THE_BLANK": {
        question = "Fill in the missing characters.";
        prompt = word.example.replace(word.hanzi, "＿＿＿");
        answer = word.hanzi;
        options = choicesForWord(lesson, answer, "hanzi");
        explanation = `${word.example} (${word.examplePinyin})`;
        break;
      }
      default:
        question = "Choose the correct pinyin for the meaning.";
        prompt = `${word.meaning} · ${word.hanzi}`;
        answer = word.pinyin;
        options = choicesForWord(lesson, answer, "pinyin");
        explanation = `${word.hanzi} is pronounced ${word.pinyin}.`;
    }
    const rotation = index % Math.max(1, otherWords.length);
    const distractors = otherWords.map((_, offset) => otherWords[(rotation + offset) % otherWords.length]);
    if (options.length < 4) {
      const field = type === "CHARACTER_TO_ENGLISH" ? "meaning" : type === "CHARACTER_TO_PINYIN" || type === "MULTIPLE_CHOICE" ? "pinyin" : type === "SENTENCE_TRANSLATION" ? "exampleMeaning" : "hanzi";
      options = choicesFor(answer, [...options, ...distractors.map((item) => item[field])]).slice(0, 4);
    }
    const answerPosition = options.length ? (index * 3 + 1) % options.length : 0;
    options = [...options.slice(answerPosition), ...options.slice(0, answerPosition)];
    return { id: `${lesson.id}-q${String(index + 1).padStart(2, "0")}`, type, question, prompt, options, correctAnswer: answer, explanation, vocabularyId: word.id };
  });
}

export function scoreLesson(exercises: Exercise[], input: LessonCompletionInput): LessonCompletionResult {
  if (input.answers.length > exercises.length) throw new Error("Too many lesson answers were submitted.");
  const knownExercises = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const submitted = new Map<string, string>();
  for (const { id, answer } of input.answers) {
    if (!knownExercises.has(id) || submitted.has(id) || typeof answer !== "string" || answer.length > 160) {
      throw new Error("Invalid lesson answers were submitted.");
    }
    submitted.set(id, answer);
  }
  const correctCount = exercises.reduce((score, exercise) => score + Number(submitted.get(exercise.id) === exercise.correctAnswer), 0);
  const perfect = exercises.length > 0 && correctCount === exercises.length;
  return {
    correctCount,
    totalQuestions: exercises.length,
    accuracy: exercises.length ? Math.round((correctCount / exercises.length) * 100) : 0,
    xpEarned: calculateLessonXp(correctCount, exercises.length),
    perfect,
  };
}

