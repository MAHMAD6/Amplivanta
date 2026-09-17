-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "dedupeKey" TEXT,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "annualPrice" DOUBLE PRECISION,
ADD COLUMN     "contactSales" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PricingBenchmark" ADD COLUMN     "benchmarkSet" TEXT NOT NULL DEFAULT 'Default',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "effectiveDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "NotificationState" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingBenchmarkSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assumptions" TEXT,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingBenchmarkSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationState_userId_idx" ON "NotificationState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationState_notificationId_userId_key" ON "NotificationState"("notificationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingBenchmarkSet_name_key" ON "PricingBenchmarkSet"("name");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_createdAt_idx" ON "Notification"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

