/*
  Warnings:

  - You are about to drop the column `group_id` on the `Credential` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_group_id_fkey";

-- DropIndex
DROP INDEX "Credential_group_id_key";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "group_id";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "credential_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
