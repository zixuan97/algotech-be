/*
  Warnings:

  - The primary key for the `ProductCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `ProductCategory` table. All the data in the column will be lost.
  - Added the required column `product_sku` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category_id` on the `ProductCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_product_id_fkey";

-- AlterTable
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_pkey",
DROP COLUMN "product_id",
ADD COLUMN     "product_sku" TEXT NOT NULL,
DROP COLUMN "category_id",
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("product_sku", "category_id");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_product_sku_fkey" FOREIGN KEY ("product_sku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
