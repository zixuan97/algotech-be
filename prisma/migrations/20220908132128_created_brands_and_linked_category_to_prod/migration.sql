/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StockQuantity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `brand_name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StockQuantity" DROP CONSTRAINT "StockQuantity_product_sku_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
ADD COLUMN     "brand_name" TEXT NOT NULL,
ALTER COLUMN "sku" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("sku");

-- AlterTable
ALTER TABLE "StockQuantity" DROP CONSTRAINT "StockQuantity_pkey",
ALTER COLUMN "product_sku" SET DATA TYPE TEXT,
ADD CONSTRAINT "StockQuantity_pkey" PRIMARY KEY ("product_sku", "location_name");

-- CreateTable
CREATE TABLE "Brand" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "product_sku" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("product_sku","category_name")
);

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brand_name_fkey" FOREIGN KEY ("brand_name") REFERENCES "Brand"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
