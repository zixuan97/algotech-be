/*
  Warnings:

  - Added the required column `product_sku` to the `StockQuantity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockQuantity" ADD COLUMN     "product_sku" TEXT NOT NULL;
