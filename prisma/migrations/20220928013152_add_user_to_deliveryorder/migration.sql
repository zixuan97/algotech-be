-- AlterEnum
ALTER TYPE "ShippingType" ADD VALUE 'GRAB';

-- DropForeignKey
ALTER TABLE "DeliveryOrder" DROP CONSTRAINT "DeliveryOrder_assignedUserId_fkey";

-- AlterTable
ALTER TABLE "DeliveryOrder" ADD COLUMN     "comments" TEXT,
ADD COLUMN     "eta" TIMESTAMP(3),
ALTER COLUMN "assignedUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
