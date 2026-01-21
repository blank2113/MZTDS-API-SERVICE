/*
  Warnings:

  - Added the required column `name` to the `USER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "USER" ADD COLUMN     "name" TEXT NOT NULL;
