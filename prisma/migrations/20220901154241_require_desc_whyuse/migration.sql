/*
  Warnings:

  - Made the column `description` on table `Group` required. This step will fail if there are existing NULL values in that column.
  - Made the column `why_useful` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "why_useful" SET NOT NULL;
