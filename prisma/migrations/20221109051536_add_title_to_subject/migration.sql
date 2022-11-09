/*
  Warnings:

  - Added the required column `isEnabled` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "title" TEXT NOT NULL;
