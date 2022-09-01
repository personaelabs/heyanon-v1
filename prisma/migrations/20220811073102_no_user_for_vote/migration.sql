/*
  Warnings:

  - You are about to drop the column `twitter_key` on the `Credential` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_user_id_fkey";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "twitter_key",
ADD COLUMN     "twitter_account" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
