-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('STANDARD', 'EXPRESS', 'PRIORITY');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('READY_FOR_DELIVERY', 'DELIVERY_IN_PROGRESS', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('MANUAL', 'SHIPPIT');

-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" SERIAL NOT NULL,
    "type" "DeliveryType" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryPersonnel" TEXT,
    "shippitTrackingNum" TEXT,
    "method" "DeliveryMode" DEFAULT 'STANDARD',
    "carrier" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'READY_FOR_DELIVERY',
    "salesOrderId" INTEGER NOT NULL,

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrder_salesOrderId_key" ON "DeliveryOrder"("salesOrderId");

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
