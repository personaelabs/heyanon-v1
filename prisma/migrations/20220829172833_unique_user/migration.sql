/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_parent_group_id_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "parent_group_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "path_length" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_key_key" ON "User"("key");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parent_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
