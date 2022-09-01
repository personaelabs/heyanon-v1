/*
  Warnings:

  - Made the column `vkey` on table `Proof` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zkey_link` on table `Proof` required. This step will fail if there are existing NULL values in that column.
  - Made the column `filename` on table `Proof` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Proof" ALTER COLUMN "vkey" SET NOT NULL,
ALTER COLUMN "zkey_link" SET NOT NULL,
ALTER COLUMN "filename" SET NOT NULL;
