/*
  Warnings:

  - You are about to drop the column `details` on the `Location` table. All the data in the column will be lost.
  - Added the required column `product_name` to the `StockQuantity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "details";

-- AlterTable
ALTER TABLE "StockQuantity" ADD COLUMN     "product_name" TEXT NOT NULL;
