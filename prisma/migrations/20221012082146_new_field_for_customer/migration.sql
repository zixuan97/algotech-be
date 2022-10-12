/*
  Warnings:

  - Added the required column `lastOrderDate` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "lastOrderDate" TIMESTAMP(3) NOT NULL;
