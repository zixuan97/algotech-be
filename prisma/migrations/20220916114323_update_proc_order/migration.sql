/*
  Warnings:

  - Added the required column `supplier_address` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_email` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_name` to the `ProcurementOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProcurementOrder" DROP CONSTRAINT "ProcurementOrder_supplier_id_fkey";

-- AlterTable
ALTER TABLE "ProcurementOrder" ADD COLUMN     "supplier_address" TEXT NOT NULL,
ADD COLUMN     "supplier_email" TEXT NOT NULL,
ADD COLUMN     "supplier_name" TEXT NOT NULL;
