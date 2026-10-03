import { notFound } from "next/navigation";
import { LessonPractice } from "@/components/learn/lesson-practice";
import { buildLessonExercises } from "@/lib/lessons/exercises";
import { getLessonById, HSK1_LESSONS } from "@/lib/lessons/content";

export default async function PracticePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();
  const currentIndex = HSK1_LESSONS.findIndex((item) => item.id === lessonId);
  return <LessonPractice lessonTitle={lesson.title} lessonId={lesson.id} nextLessonId={HSK1_LESSONS[currentIndex + 1]?.id} exercises={buildLessonExercises(lesson)} />;
}
