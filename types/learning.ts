export type LearningLevel = "HSK1" | "HSK2" | "HSK3";

export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  examplePinyin: string;
  exampleMeaning: string;
  level: LearningLevel;
}

export interface LessonContent {
  id: string;
  level: LearningLevel;
  unitId: string;
  unitNumber: number;
  unitTitle: string;
  order: number;
  title: string;
  description: string;
  vocabulary: VocabularyItem[];
  dayNumber?: number;
  objective?: string;
  listening?: ListeningSection;
  reading?: ReadingSection;
  practiceExercises?: Exercise[];
}

export type ExerciseType =
  | "CHARACTER_TO_ENGLISH"
  | "ENGLISH_TO_CHARACTER"
  | "CHARACTER_TO_PINYIN"
  | "PINYIN_TO_CHARACTER"
  | "SENTENCE_TRANSLATION"
  | "FILL_IN_THE_BLANK"
  | "MULTIPLE_CHOICE"
  | "LISTENING_COMPREHENSION"
  | "MATCH_CHINESE_TO_ENGLISH"
  | "MATCH_ENGLISH_TO_CHINESE"
  | "WORD_ORDER";

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  vocabularyId: string;
  listenText?: string;
}

export interface ListeningSection {
  items: Array<{ text: string; pinyin: string; meaning: string }>;
  sentences?: Array<{ text: string; pinyin: string; meaning: string }>;
  exercises: Exercise[];
}

export interface ReadingSection {
  text: string;
  pinyin: string;
  translation: string;
  questions: Exercise[];
}

export type LessonSectionId = "listening" | "reading" | "vocabulary" | "practice";

export type ExerciseAnswer = Pick<Exercise, "id"> & { answer: string };

export interface LessonUnit {
  id: string;
  order: number;
  title: string;
  lessons: LessonContent[];
}

export interface LessonCompletionInput {
  lessonId: string;
  answers: ExerciseAnswer[];
}

export interface LessonCompletionResult {
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  perfect: boolean;
}

