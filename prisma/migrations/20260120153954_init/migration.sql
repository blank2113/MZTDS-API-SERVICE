-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateTable
CREATE TABLE "USER" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("id")
);
