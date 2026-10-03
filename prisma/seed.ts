import { prisma } from "../lib/db/prisma";
import { HSK1_LESSONS } from "../lib/lessons/content";

async function main() {
  for (const lesson of HSK1_LESSONS) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      create: { id: lesson.id, level: lesson.level, unitNumber: lesson.unitNumber, order: lesson.order, title: lesson.title, description: lesson.description },
      update: { level: lesson.level, unitNumber: lesson.unitNumber, order: lesson.order, title: lesson.title, description: lesson.description },
    });
    for (const word of lesson.vocabulary) {
      await prisma.vocabulary.upsert({
        where: { id: word.id },
        create: { id: word.id, hanzi: word.hanzi, pinyin: word.pinyin, meaning: word.meaning, partOfSpeech: word.partOfSpeech, example: word.example, examplePinyin: word.examplePinyin, exampleMeaning: word.exampleMeaning, level: word.level },
        update: { hanzi: word.hanzi, pinyin: word.pinyin, meaning: word.meaning, partOfSpeech: word.partOfSpeech, example: word.example, examplePinyin: word.examplePinyin, exampleMeaning: word.exampleMeaning, level: word.level },
      });
      await prisma.lessonVocabulary.upsert({
        where: { lessonId_vocabularyId: { lessonId: lesson.id, vocabularyId: word.id } },
        create: { lessonId: lesson.id, vocabularyId: word.id },
        update: {},
      });
    }
  }
  const starterAchievements = [
    ["first-lesson", "First Lesson", "Complete your first lesson."],
    ["100-xp", "100 XP", "Earn 100 experience points."],
    ["7-day-streak", "7 Day Streak", "Practice on seven days in a row."],
    ["50-words", "50 Words Learned", "Get a first correct answer on 50 words."],
    ["100-words", "100 Words Learned", "Get a first correct answer on 100 words."],
    ["first-perfect", "First Perfect Lesson", "Complete a lesson with every answer correct."],
  ] as const;
  for (const [id, name, description] of starterAchievements) {
    await prisma.achievement.upsert({ where: { id }, create: { id, name, description }, update: { name, description } });
  }
  console.info(`Seeded ${HSK1_LESSONS.length} HSK 1 lessons, ${HSK1_LESSONS.reduce((sum, lesson) => sum + lesson.vocabulary.length, 0)} vocabulary entries, and ${starterAchievements.length} achievements.`);
}

main()
  .catch(() => {
    process.exitCode = 1;
    console.error("Seeding failed. Check DATABASE_URL and the database connection.");
  })
  .finally(async () => prisma.$disconnect());
