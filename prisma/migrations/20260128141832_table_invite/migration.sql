-- CreateTable
CREATE TABLE "TableInvite" (
    "id" SERIAL NOT NULL,
    "table_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userFcmTokenId" INTEGER,

    CONSTRAINT "TableInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TableInvite" ADD CONSTRAINT "TableInvite_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableInvite" ADD CONSTRAINT "TableInvite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableInvite" ADD CONSTRAINT "TableInvite_userFcmTokenId_fkey" FOREIGN KEY ("userFcmTokenId") REFERENCES "UserFcmToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
