/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `method` on the `DeliveryOrder` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `DeliveryOrder` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DeliveryOrder` table. All the data in the column will be lost.
  - Added the required column `shippingDate` to the `DeliveryOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('MANUAL', 'SHIPPIT');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('CREATED', 'PAID', 'PREPARING', 'PREPARED', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "SalesOrder" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "SalesOrder" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "SalesOrder" ALTER COLUMN "orderStatus" SET DEFAULT 'PAID';
COMMIT;

-- AlterTable
ALTER TABLE "DeliveryOrder" DROP COLUMN "method",
DROP COLUMN "status",
DROP COLUMN "type",
ADD COLUMN     "deliveryMode" "DeliveryMode" DEFAULT 'STANDARD',
ADD COLUMN     "shippingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "shippingType" "ShippingType" NOT NULL DEFAULT 'MANUAL',
ALTER COLUMN "deliveryDate" DROP NOT NULL;

-- DropEnum
DROP TYPE "DeliveryStatus";

-- DropEnum
DROP TYPE "DeliveryType";
