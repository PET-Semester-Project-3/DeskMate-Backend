/*
  Warnings:

  - You are about to drop the column `height` on the `Desk` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Desk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Desk" DROP COLUMN "height",
DROP COLUMN "manufacturer";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "main_desk_id" TEXT;
