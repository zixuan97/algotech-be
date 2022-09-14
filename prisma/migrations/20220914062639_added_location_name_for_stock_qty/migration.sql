/*
  Warnings:

  - Added the required column `location_name` to the `StockQuantity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockQuantity" ADD COLUMN     "location_name" TEXT NOT NULL;
