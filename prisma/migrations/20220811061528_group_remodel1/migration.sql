/*
  Warnings:

  - You are about to drop the column `group_abbr` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `group_name` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `twitter_account` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the `API` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `abbr_name` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `static` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Made the column `last_update` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "API" DROP CONSTRAINT "API_group_id_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "group_abbr",
DROP COLUMN "group_name",
DROP COLUMN "twitter_account",
ADD COLUMN     "abbr_name" TEXT NOT NULL,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "static" BOOLEAN NOT NULL,
ALTER COLUMN "last_update" SET NOT NULL,
ALTER COLUMN "last_update" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "last_update" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "API";

-- CreateTable
CREATE TABLE "Credential" (
    "id" SERIAL NOT NULL,
    "twitter_key" TEXT,
    "twit_consumer_key" TEXT,
    "twit_consumer_secret" TEXT,
    "twit_access_token" TEXT,
    "twit_access_secret" TEXT,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_group_id_key" ON "Credential"("group_id");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
