/*
  Warnings:

  - You are about to drop the column `createdAt` on the `SalesOrder` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `SalesOrder` table. All the data in the column will be lost.
  - You are about to drop the `SalesOrderProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdTime` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformType` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('SHOPEE', 'SHOPIFY', 'LAZADA', 'REDMART', 'OTHERS');

-- DropForeignKey
ALTER TABLE "SalesOrderProduct" DROP CONSTRAINT "SalesOrderProduct_salesOrderId_fkey";

-- AlterTable
ALTER TABLE "SalesOrder" DROP COLUMN "createdAt",
DROP COLUMN "platform",
ADD COLUMN     "createdTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "platformType" "PlatformType" NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "SalesOrderProduct";

-- DropEnum
DROP TYPE "Platform";

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "salesOrderId" INTEGER NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
