-- CreateEnum
CREATE TYPE "TableRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToTable" (
    "user_id" INTEGER NOT NULL,
    "table_id" INTEGER NOT NULL,
    "role" "TableRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserToTable_pkey" PRIMARY KEY ("user_id","table_id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "table_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "column_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_name_key" ON "Table"("name");

-- CreateIndex
CREATE INDEX "Table_name_idx" ON "Table"("name");

-- CreateIndex
CREATE INDEX "Column_id_table_id_idx" ON "Column"("id", "table_id");

-- CreateIndex
CREATE INDEX "Card_id_column_id_idx" ON "Card"("id", "column_id");

-- CreateIndex
CREATE INDEX "User_name_email_idx" ON "User"("name", "email");

-- AddForeignKey
ALTER TABLE "UserToTable" ADD CONSTRAINT "UserToTable_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToTable" ADD CONSTRAINT "UserToTable_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
