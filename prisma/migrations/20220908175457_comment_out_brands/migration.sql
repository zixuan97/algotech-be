/*
  Warnings:

  - You are about to drop the column `brand_id` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brand_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brand_id";
