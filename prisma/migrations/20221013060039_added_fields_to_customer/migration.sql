/*
  Warnings:

  - Added the required column `avgOrderValue` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daysSinceLastPurchase` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "avgOrderValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "daysSinceLastPurchase" INTEGER NOT NULL;
