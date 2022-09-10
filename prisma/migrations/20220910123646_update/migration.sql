/*
  Warnings:

  - Added the required column `category_name` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "qtyThreshold" INTEGER;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "category_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);
