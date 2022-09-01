/*
  Warnings:

  - Added the required column `site_admin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "site_admin" BOOLEAN NOT NULL;
