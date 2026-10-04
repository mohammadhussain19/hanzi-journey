ALTER TABLE "LessonProgress" ADD COLUMN "completedSections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

