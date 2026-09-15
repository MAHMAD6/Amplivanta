-- AlterTable
ALTER TABLE "HashtagSet" ADD COLUMN     "category" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "platform" TEXT;

-- CreateTable
CREATE TABLE "WorkspacePreference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspacePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentionReference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "platform" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentionReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePreference_workspaceId_scope_key" ON "WorkspacePreference"("workspaceId", "scope");

-- CreateIndex
CREATE INDEX "MentionReference_workspaceId_idx" ON "MentionReference"("workspaceId");

