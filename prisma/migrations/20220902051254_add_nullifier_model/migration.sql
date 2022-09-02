/*
  Warnings:

  - You are about to drop the column `reputation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Vote` table. All the data in the column will be lost.
  - Made the column `msg` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `msg_hash` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nullifier_id` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_user_id_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "nullifier_id" INTEGER,
ALTER COLUMN "msg" SET NOT NULL,
ALTER COLUMN "msg_hash" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "reputation";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "user_id",
ADD COLUMN     "nullifier_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Nullifier" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "reputation" INTEGER DEFAULT 0,

    CONSTRAINT "Nullifier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_nullifier_id_fkey" FOREIGN KEY ("nullifier_id") REFERENCES "Nullifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_nullifier_id_fkey" FOREIGN KEY ("nullifier_id") REFERENCES "Nullifier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
