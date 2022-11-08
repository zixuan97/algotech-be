/*
  Warnings:

  - You are about to drop the column `userType` on the `DiscountCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscountCode" DROP COLUMN "userType";

-- DropEnum
DROP TYPE "UserType";
