/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `ScheduledNewsletter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `ScheduledNewsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScheduledNewsletter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BulkOrder" ALTER COLUMN "payeeRemarks" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledNewsletter" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "company" TEXT,
ADD COLUMN     "contactNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledNewsletter_jobId_key" ON "ScheduledNewsletter"("jobId");
