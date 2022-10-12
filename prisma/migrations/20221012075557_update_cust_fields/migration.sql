-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "totalSpent" DROP DEFAULT,
ALTER COLUMN "ordersCount" SET DEFAULT 1;
