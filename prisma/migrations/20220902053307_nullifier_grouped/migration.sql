/*
  Warnings:

  - Added the required column `group_id` to the `Nullifier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "ext_nullifier" TEXT;

-- AlterTable
ALTER TABLE "Nullifier" ADD COLUMN     "group_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Nullifier" ADD CONSTRAINT "Nullifier_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
