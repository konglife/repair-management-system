/*
  Warnings:

  - Added the required column `unitId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "unitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "public"."units"("name");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
