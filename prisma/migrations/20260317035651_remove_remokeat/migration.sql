/*
  Warnings:

  - You are about to drop the column `revoke_at` on the `session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "revoke_at";
