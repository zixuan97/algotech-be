/*
  Warnings:

  - Added the required column `bulkOrderStatus` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BulkOrderStatus" AS ENUM ('CREATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'FULFILLED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BulkOrder" ADD COLUMN     "bulkOrderStatus" "BulkOrderStatus" NOT NULL;
