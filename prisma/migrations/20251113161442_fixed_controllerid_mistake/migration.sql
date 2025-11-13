/*
  Warnings:

  - You are about to drop the column `controller_id` on the `ScheduledTask` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `ScheduledTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduledTask" DROP CONSTRAINT "ScheduledTask_controller_id_fkey";

-- AlterTable
ALTER TABLE "ScheduledTask" DROP COLUMN "controller_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ScheduledTask" ADD CONSTRAINT "ScheduledTask_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
