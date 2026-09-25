-- AlterTable
ALTER TABLE "User" DROP COLUMN "hostelBlock",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpHash" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpLastSentAt" TIMESTAMP(3);

-- Mark existing user accounts as email verified
UPDATE "User" SET "emailVerified" = true;
