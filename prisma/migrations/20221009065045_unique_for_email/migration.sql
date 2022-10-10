/*
  Warnings:

  - You are about to drop the column `platformType` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "platformType";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
