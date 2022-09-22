-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('SHOPEE', 'SHOPIFY', 'LAZADA', 'REDMART');

-- CreateTable
CREATE TABLE "SalesOrderProduct" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "salesOrderId" INTEGER NOT NULL,

    CONSTRAINT "SalesOrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerContactNo" TEXT NOT NULL,
    "customerEmail" TEXT,
    "platform" "Platform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesOrderProduct" ADD CONSTRAINT "SalesOrderProduct_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
