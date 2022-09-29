/*
  Warnings:

  - Added the required column `quantity` to the `BundleProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BundleProduct" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SalesOrderBundleItem" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "salesOrderItemId" INTEGER NOT NULL,

    CONSTRAINT "SalesOrderBundleItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesOrderBundleItem" ADD CONSTRAINT "SalesOrderBundleItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
