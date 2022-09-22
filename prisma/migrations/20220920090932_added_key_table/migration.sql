-- CreateTable
CREATE TABLE "Keys" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keys_key_key" ON "Keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Keys_value_key" ON "Keys"("value");
