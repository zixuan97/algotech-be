/*
  Warnings:

  - The primary key for the `DeliveryStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DeliveryStatus" DROP CONSTRAINT "DeliveryStatus_pkey",
ADD CONSTRAINT "DeliveryStatus_pkey" PRIMARY KEY ("deliveryOrderId", "date", "timestamp", "status");
