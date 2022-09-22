/*
  Warnings:

  - Added the required column `amount` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "amount" TEXT NOT NULL;
