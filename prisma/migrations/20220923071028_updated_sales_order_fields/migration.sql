/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `SalesOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerRemarks` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'PAID', 'PREPARED', 'SHIPPED', 'COMPLETED');

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "customerRemarks" TEXT NOT NULL,
ADD COLUMN     "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PAID';

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderId_key" ON "SalesOrder"("orderId");
