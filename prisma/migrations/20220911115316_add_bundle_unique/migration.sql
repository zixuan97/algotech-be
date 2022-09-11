/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bundle_name_key" ON "Bundle"("name");
