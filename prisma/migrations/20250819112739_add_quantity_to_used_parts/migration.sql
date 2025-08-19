/*
  Warnings:

  - Added the required column `quantity` to the `used_parts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."used_parts" ADD COLUMN     "quantity" INTEGER NOT NULL;
