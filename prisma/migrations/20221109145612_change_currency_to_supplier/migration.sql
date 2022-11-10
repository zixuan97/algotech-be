/*
  Warnings:

  - You are about to drop the column `currency` on the `SupplierProduct` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SupplierProduct" DROP COLUMN "currency";
