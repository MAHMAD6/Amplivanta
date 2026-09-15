-- CreateTable
CREATE TABLE "MediaGenerationJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'fal',
    "task" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "requestId" TEXT,
    "statusUrl" TEXT,
    "responseUrl" TEXT,
    "prompt" TEXT,
    "input" JSONB NOT NULL,
    "creditsCharged" INTEGER NOT NULL DEFAULT 0,
    "creditsRefunded" BOOLEAN NOT NULL DEFAULT false,
    "assetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MediaGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaGenerationJob_requestId_key" ON "MediaGenerationJob"("requestId");

-- CreateIndex
CREATE INDEX "MediaGenerationJob_workspaceId_createdAt_idx" ON "MediaGenerationJob"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaGenerationJob_status_updatedAt_idx" ON "MediaGenerationJob"("status", "updatedAt");

