/*
  Warnings:

  - Added the required column `payeeContactNo` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BulkOrder" ADD COLUMN     "payeeContactNo" TEXT NOT NULL;
