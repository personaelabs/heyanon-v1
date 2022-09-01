/*
  Warnings:

  - Made the column `twitter_account` on table `Credential` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Credential" ALTER COLUMN "twitter_account" SET NOT NULL;
