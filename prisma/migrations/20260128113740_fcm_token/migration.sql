/*
  Warnings:

  - You are about to drop the column `userId` on the `UserFcmToken` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `UserFcmToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserFcmToken" DROP CONSTRAINT "UserFcmToken_userId_fkey";

-- AlterTable
ALTER TABLE "UserFcmToken" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserFcmToken" ADD CONSTRAINT "UserFcmToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
