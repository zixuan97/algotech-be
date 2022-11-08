/*
  Warnings:

  - The values [BANK_TRANSFER] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [GRAB] on the enum `ShippingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `vettedBy` on the `LeaveApplication` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `Subject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discountCode]` on the table `DiscountCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdAt` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdatedAt` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdatedById` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CREDIT_CARD', 'PAYNOW');
ALTER TABLE "BulkOrder" ALTER COLUMN "paymentMode" TYPE "PaymentMode_new" USING ("paymentMode"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "PaymentMode_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ShippingType_new" AS ENUM ('MANUAL', 'SHIPPIT', 'LALAMOVE');
ALTER TABLE "DeliveryOrder" ALTER COLUMN "shippingType" DROP DEFAULT;
ALTER TABLE "DeliveryOrder" ALTER COLUMN "shippingType" TYPE "ShippingType_new" USING ("shippingType"::text::"ShippingType_new");
ALTER TYPE "ShippingType" RENAME TO "ShippingType_old";
ALTER TYPE "ShippingType_new" RENAME TO "ShippingType";
DROP TYPE "ShippingType_old";
ALTER TABLE "DeliveryOrder" ALTER COLUMN "shippingType" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterTable
ALTER TABLE "LeaveApplication" DROP COLUMN "vettedBy",
ADD COLUMN     "vettedById" INTEGER;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "lastUpdated",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastUpdatedById" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_discountCode_key" ON "DiscountCode"("discountCode");

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_vettedById_fkey" FOREIGN KEY ("vettedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
