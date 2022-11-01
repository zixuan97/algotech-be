/*
  Warnings:

  - You are about to drop the column `status` on the `QuizQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "status";
