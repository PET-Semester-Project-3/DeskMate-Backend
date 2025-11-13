-- AlterTable
ALTER TABLE "ScheduledTask" ALTER COLUMN "completed_at" DROP NOT NULL,
ALTER COLUMN "error_message" DROP NOT NULL;
