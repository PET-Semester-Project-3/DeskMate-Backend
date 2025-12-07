/*
  Warnings:

  - A unique constraint covering the columns `[main_desk_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_main_desk_id_key" ON "User"("main_desk_id");
