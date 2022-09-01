/*
  Warnings:

  - A unique constraint covering the columns `[abbr_name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_abbr_name_key" ON "Group"("abbr_name");
