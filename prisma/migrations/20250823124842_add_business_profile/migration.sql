-- CreateTable
CREATE TABLE "public"."business_profiles" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "contactEmail" TEXT,
    "logoUrl" TEXT,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);
