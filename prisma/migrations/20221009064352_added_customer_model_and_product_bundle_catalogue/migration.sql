-- CreateTable
CREATE TABLE "Newsletter" (
    "id" SERIAL NOT NULL,
    "emailDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "emailBodyTitle" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCatalogue" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleCatalogue" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "bundleId" INTEGER NOT NULL,

    CONSTRAINT "BundleCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "platformType" "PlatformType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "acceptsMarketing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductCatalogue" ADD CONSTRAINT "ProductCatalogue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleCatalogue" ADD CONSTRAINT "BundleCatalogue_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
