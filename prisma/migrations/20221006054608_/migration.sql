-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CREDIT_CARD', 'CASH', 'BANK_TRANSFER', 'PAYNOW');

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "bulkOrderId" INTEGER;

-- CreateTable
CREATE TABLE "BulkOrder" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "payeeName" TEXT NOT NULL,
    "payeeEmail" TEXT NOT NULL,
    "payeeRemarks" TEXT NOT NULL,

    CONSTRAINT "BulkOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
