/*
  Warnings:

  - The values [CASH] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'PAYNOW');
ALTER TABLE "BulkOrder" ALTER COLUMN "paymentMode" TYPE "PaymentMode_new" USING ("paymentMode"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "PaymentMode_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PlatformType" ADD VALUE 'B2B';

-- AlterEnum
ALTER TYPE "ShippingType" ADD VALUE 'LALAMOVE';
