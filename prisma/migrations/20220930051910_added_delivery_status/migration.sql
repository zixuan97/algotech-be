-- AlterTable
ALTER TABLE "DeliveryOrder" ALTER COLUMN "shippingDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DeliveryStatus" (
    "status" TEXT NOT NULL,
    "statusOwner" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "deliveryOrderId" INTEGER NOT NULL,

    CONSTRAINT "DeliveryStatus_pkey" PRIMARY KEY ("deliveryOrderId","date","timestamp")
);

-- AddForeignKey
ALTER TABLE "DeliveryStatus" ADD CONSTRAINT "DeliveryStatus_deliveryOrderId_fkey" FOREIGN KEY ("deliveryOrderId") REFERENCES "DeliveryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
