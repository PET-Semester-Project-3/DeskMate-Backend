/*
  Warnings:

  - A unique constraint covering the columns `[route]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Desk" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledTask" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserDesk" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserPermission" ALTER COLUMN "updated_at" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_route_key" ON "Permission"("route");
