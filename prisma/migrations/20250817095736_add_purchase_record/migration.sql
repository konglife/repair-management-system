-- CreateTable
CREATE TABLE "public"."purchase_records" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "purchase_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."purchase_records" ADD CONSTRAINT "purchase_records_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
