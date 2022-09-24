/*
  Warnings:

  - Added the required column `createdTime` to the `SalesOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesOrderItem" ADD COLUMN     "createdTime" TIMESTAMP(3) NOT NULL;
