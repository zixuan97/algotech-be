/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `StockQuantity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `StockQuantity` table. All the data in the column will be lost.
  - Added the required column `category_name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_sku` to the `StockQuantity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_category_id_fkey";

-- DropForeignKey
ALTER TABLE "StockQuantity" DROP CONSTRAINT "StockQuantity_product_id_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "category_id",
DROP COLUMN "id",
ADD COLUMN     "category_name" TEXT NOT NULL,
ADD COLUMN     "sku" INTEGER NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("sku");

-- AlterTable
ALTER TABLE "StockQuantity" DROP CONSTRAINT "StockQuantity_pkey",
DROP COLUMN "product_id",
ADD COLUMN     "product_sku" INTEGER NOT NULL,
ADD CONSTRAINT "StockQuantity_pkey" PRIMARY KEY ("product_sku", "location_name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
