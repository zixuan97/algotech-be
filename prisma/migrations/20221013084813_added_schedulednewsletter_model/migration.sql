-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SENT', 'CANCELLED', 'SCHEDULED');

-- CreateTable
CREATE TABLE "ScheduledNewsletter" (
    "id" SERIAL NOT NULL,
    "newsletterId" INTEGER NOT NULL,
    "customerEmails" TEXT[],
    "sentDate" TIMESTAMP(3) NOT NULL,
    "jobStatus" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "ScheduledNewsletter_pkey" PRIMARY KEY ("id")
);
