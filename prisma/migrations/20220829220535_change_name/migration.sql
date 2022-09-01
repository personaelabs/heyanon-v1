/*
  Warnings:

  - You are about to drop the column `indicies` on the `Leaf` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Leaf" DROP COLUMN "indicies",
ADD COLUMN     "indices" TEXT[];
