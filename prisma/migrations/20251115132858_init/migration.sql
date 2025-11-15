/*
  Warnings:

  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `label` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Desk" ALTER COLUMN "controller_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "name",
ADD COLUMN     "label" VARCHAR(50) NOT NULL,
ADD COLUMN     "route" TEXT NOT NULL;
