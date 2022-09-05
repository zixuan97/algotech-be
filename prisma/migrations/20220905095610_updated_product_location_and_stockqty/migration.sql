/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_sold` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "quantity_sold";

-- CreateTable
CREATE TABLE "Location" (
    "name" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "StockQuantity" (
    "product_id" INTEGER NOT NULL,
    "location_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StockQuantity_pkey" PRIMARY KEY ("product_id","location_name")
);

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_location_name_fkey" FOREIGN KEY ("location_name") REFERENCES "Location"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
