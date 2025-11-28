-- CreateTable
CREATE TABLE "DeskMate" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "achievements" TEXT[],

    CONSTRAINT "DeskMate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeskMate_user_id_key" ON "DeskMate"("user_id");

-- AddForeignKey
ALTER TABLE "DeskMate" ADD CONSTRAINT "DeskMate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
