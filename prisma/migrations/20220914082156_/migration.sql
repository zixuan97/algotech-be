/*
  Warnings:

  - Added the required column `warehouse_address` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProcurementOrder" ADD COLUMN     "warehouse_address" TEXT NOT NULL;
