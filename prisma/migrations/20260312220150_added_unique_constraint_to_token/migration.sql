/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `reset_token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reset_token_token_key" ON "reset_token"("token");
