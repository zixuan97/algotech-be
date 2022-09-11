/*
  Warnings:

  - The primary key for the `ProductCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `address` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_product_sku_fkey";

-- AlterTable
ALTER TABLE "BundleProduct" ALTER COLUMN "product_sku" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_pkey",
ADD COLUMN     "product_id" INTEGER NOT NULL,
ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("product_id", "category_id");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
