/*
  Warnings:

  - Added the required column `quizOrder` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicOrder` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('COMPANY', 'POLICY', 'PROCESS');

-- DropIndex
DROP INDEX "Step_title_key";

-- DropIndex
DROP INDEX "Topic_name_key";

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "passingScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "completionRate" SET DEFAULT 0,
ALTER COLUMN "completionRate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "quizOrder" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "topicOrder" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "SubjectType" NOT NULL,
ALTER COLUMN "completionRate" SET DEFAULT 0,
ALTER COLUMN "completionRate" SET DATA TYPE DOUBLE PRECISION;
