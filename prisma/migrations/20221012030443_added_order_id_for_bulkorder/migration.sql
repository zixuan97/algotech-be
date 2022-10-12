/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `BulkOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BulkOrder" ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BulkOrder_orderId_key" ON "BulkOrder"("orderId");
