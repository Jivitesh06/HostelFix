/*
  Warnings:

  - You are about to drop the column `deadlineAt` on the `Complaint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "deadlineAt",
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "slaAlertSentAt" TIMESTAMP(3),
ADD COLUMN     "slaDeadline" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Complaint_slaDeadline_idx" ON "Complaint"("slaDeadline");

-- CreateIndex
CREATE INDEX "Complaint_slaAlertSentAt_idx" ON "Complaint"("slaAlertSentAt");
