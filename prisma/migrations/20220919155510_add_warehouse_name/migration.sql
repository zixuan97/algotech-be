/*
  Warnings:

  - Added the required column `warehouseName` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProcurementOrder" ADD COLUMN     "warehouseName" TEXT NOT NULL;
