-- CreateTable
CREATE TABLE "TgLinkToken" (
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TgLinkToken_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "TgLinkToken_email_idx" ON "TgLinkToken"("email");
