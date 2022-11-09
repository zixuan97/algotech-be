/*
  Warnings:

  - Added the required column `minOrderAmount` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `SupplierProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "minOrderAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SupplierProduct" ADD COLUMN     "currency" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "JobRole" (
    "id" SERIAL NOT NULL,
    "jobRole" TEXT NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobRoleToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_jobRole_key" ON "JobRole"("jobRole");

-- CreateIndex
CREATE UNIQUE INDEX "_JobRoleToUser_AB_unique" ON "_JobRoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_JobRoleToUser_B_index" ON "_JobRoleToUser"("B");

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
