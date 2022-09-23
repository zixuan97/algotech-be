/*
  Warnings:

  - Changed the type of `createdTime` on the `SalesOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SalesOrder" DROP COLUMN "createdTime",
ADD COLUMN     "createdTime" TIMESTAMP(3) NOT NULL;
