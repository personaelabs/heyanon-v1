/*
  Warnings:

  - A unique constraint covering the columns `[twitter_account]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credential_twitter_account_key" ON "Credential"("twitter_account");
