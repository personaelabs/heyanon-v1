/*
  Warnings:

  - Changed the type of `moderation_status` on the `Group` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ModStatus" AS ENUM ('NONE', 'SITEADMIN', 'GROUPADMIN');

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "moderation_status",
ADD COLUMN     "moderation_status" "ModStatus" NOT NULL;
