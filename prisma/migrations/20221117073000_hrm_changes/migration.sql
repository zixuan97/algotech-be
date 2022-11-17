/*
  Warnings:

  - The values [WRITTEN] on the enum `AnswerType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isEnabled` on the `DiscountCode` table. All the data in the column will be lost.
  - You are about to drop the column `minWordCount` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `writtenAnswer` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the `_SubjectToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `correctAnswer` on the `QuizQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AnswerType_new" AS ENUM ('MCQ', 'TRUEFALSE');
ALTER TABLE "QuizQuestion" ALTER COLUMN "type" TYPE "AnswerType_new" USING ("type"::text::"AnswerType_new");
ALTER TYPE "AnswerType" RENAME TO "AnswerType_old";
ALTER TYPE "AnswerType_new" RENAME TO "AnswerType";
DROP TYPE "AnswerType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_SubjectToUser" DROP CONSTRAINT "_SubjectToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToUser" DROP CONSTRAINT "_SubjectToUser_B_fkey";

-- AlterTable
ALTER TABLE "DiscountCode" DROP COLUMN "isEnabled";

-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProcurementOrder" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "minWordCount",
DROP COLUMN "writtenAnswer",
DROP COLUMN "correctAnswer",
ADD COLUMN     "correctAnswer" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_SubjectToUser";

-- CreateTable
CREATE TABLE "EmployeeSubjectRecord" (
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "EmployeeSubjectRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeQuizQuestionRecord" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeQuizQuestionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeSubjectRecordToQuiz" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeSubjectRecordToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSubjectRecord_subjectId_userId_key" ON "EmployeeSubjectRecord"("subjectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeQuizQuestionRecord_questionId_userId_key" ON "EmployeeQuizQuestionRecord"("questionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeSubjectRecordToQuiz_AB_unique" ON "_EmployeeSubjectRecordToQuiz"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeSubjectRecordToQuiz_B_index" ON "_EmployeeSubjectRecordToQuiz"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeSubjectRecordToTopic_AB_unique" ON "_EmployeeSubjectRecordToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeSubjectRecordToTopic_B_index" ON "_EmployeeSubjectRecordToTopic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_title_key" ON "Subject"("title");

-- AddForeignKey
ALTER TABLE "EmployeeSubjectRecord" ADD CONSTRAINT "EmployeeSubjectRecord_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSubjectRecord" ADD CONSTRAINT "EmployeeSubjectRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQuizQuestionRecord" ADD CONSTRAINT "EmployeeQuizQuestionRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQuizQuestionRecord" ADD CONSTRAINT "EmployeeQuizQuestionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToQuiz" ADD CONSTRAINT "_EmployeeSubjectRecordToQuiz_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeSubjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToQuiz" ADD CONSTRAINT "_EmployeeSubjectRecordToQuiz_B_fkey" FOREIGN KEY ("B") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToTopic" ADD CONSTRAINT "_EmployeeSubjectRecordToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeSubjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToTopic" ADD CONSTRAINT "_EmployeeSubjectRecordToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
