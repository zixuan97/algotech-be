/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `StockQuantity` table. All the data in the column will be lost.
  - Added the required column `productName` to the `BundleProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BundleProduct" ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "StockQuantity" DROP COLUMN "price";
