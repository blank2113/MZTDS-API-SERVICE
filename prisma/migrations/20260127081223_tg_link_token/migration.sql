-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_id" BIGINT;
