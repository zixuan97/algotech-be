/*
  Warnings:

  - The values [CREATED] on the enum `BulkOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BulkOrderStatus_new" AS ENUM ('PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'FULFILLED', 'CANCELLED');
ALTER TABLE "BulkOrder" ALTER COLUMN "bulkOrderStatus" TYPE "BulkOrderStatus_new" USING ("bulkOrderStatus"::text::"BulkOrderStatus_new");
ALTER TYPE "BulkOrderStatus" RENAME TO "BulkOrderStatus_old";
ALTER TYPE "BulkOrderStatus_new" RENAME TO "BulkOrderStatus";
DROP TYPE "BulkOrderStatus_old";
COMMIT;

-- AddForeignKey
ALTER TABLE "ScheduledNewsletter" ADD CONSTRAINT "ScheduledNewsletter_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
