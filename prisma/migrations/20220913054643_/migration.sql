/*
  Warnings:

  - You are about to drop the column `amount` on the `ProcurementOrder` table. All the data in the column will be lost.
  - The primary key for the `ProcurementOrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `product_id` on the `ProcurementOrderItem` table. All the data in the column will be lost.
  - Added the required column `total_amount` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `ProcurementOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_sku` to the `ProcurementOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `ProcurementOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProcurementOrderItem" DROP CONSTRAINT "ProcurementOrderItem_product_id_fkey";

-- AlterTable
ALTER TABLE "ProcurementOrder" DROP COLUMN "amount",
ADD COLUMN     "total_amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ProcurementOrderItem" DROP CONSTRAINT "ProcurementOrderItem_pkey",
DROP COLUMN "product_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "product_name" TEXT NOT NULL,
ADD COLUMN     "product_sku" TEXT NOT NULL,
ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "ProcurementOrderItem_pkey" PRIMARY KEY ("id");
