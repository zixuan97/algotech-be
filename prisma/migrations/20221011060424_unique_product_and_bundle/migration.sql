/*
  Warnings:

  - A unique constraint covering the columns `[bundleId]` on the table `BundleCatalogue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `ProductCatalogue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BundleCatalogue_bundleId_key" ON "BundleCatalogue"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogue_productId_key" ON "ProductCatalogue"("productId");
