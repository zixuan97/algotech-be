/*
  Warnings:

  - Added the required column `discountCode` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionAmount` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountCodeType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('B2B', 'B2C');

-- AlterTable
ALTER TABLE "BulkOrder" ADD COLUMN     "discountCode" TEXT NOT NULL,
ADD COLUMN     "transactionAmount" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" SERIAL NOT NULL,
    "discountCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "customerEmails" TEXT[],
    "type" "DiscountCodeType" NOT NULL,
    "userType" "UserType" NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);
