-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "templateKey" TEXT;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "goal" TEXT,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "segmentId" TEXT,
ADD COLUMN     "templateKey" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "cursor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "environment" TEXT NOT NULL DEFAULT 'live',
ADD COLUMN     "error" TEXT,
ADD COLUMN     "goalReached" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resumeAt" TIMESTAMP(3),
ADD COLUMN     "retryOfId" TEXT,
ADD COLUMN     "version" INTEGER;

-- AlterTable
ALTER TABLE "EmailCampaign" ADD COLUMN     "blocks" JSONB,
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "recipientCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "replyTo" TEXT,
ADD COLUMN     "segmentId" TEXT,
ADD COLUMN     "workflowId" TEXT;

-- AlterTable
ALTER TABLE "EmailSend" ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "error" TEXT;

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "confirmationSubject" TEXT,
ADD COLUMN     "consentText" TEXT,
ADD COLUMN     "privacyUrl" TEXT,
ADD COLUMN     "requireConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "starts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "termsUrl" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workflowId" TEXT;

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Segment" ADD COLUMN     "contactIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "refreshedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'crm',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'dynamic';

-- AlterTable
ALTER TABLE "LandingPage" ADD COLUMN     "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contentReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "domainId" TEXT,
ADD COLUMN     "formId" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "seoReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialImage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "templateKey" TEXT,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "workflowId" TEXT;

-- AlterTable
ALTER TABLE "LandingPageVersion" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "authChecks" JSONB,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'publishing';

-- AlterTable
ALTER TABLE "EventDefinition" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'custom',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validationStatus" TEXT;

-- CreateTable
CREATE TABLE "WorkflowVersion" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "nodes" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageVisit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "experimentId" TEXT,
    "variant" TEXT,
    "source" TEXT,
    "device" TEXT,
    "formStarted" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandingPageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "value" TEXT,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreBand" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "contactsScored" INTEGER NOT NULL DEFAULT 0,
    "rulesApplied" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScoringRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'form_submission',
    "minSampleSize" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "variants" JSONB NOT NULL,
    "winner" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVersion_workflowId_version_key" ON "WorkflowVersion"("workflowId", "version");

-- CreateIndex
CREATE INDEX "LandingPageVisit_landingPageId_createdAt_idx" ON "LandingPageVisit"("landingPageId", "createdAt");

-- CreateIndex
CREATE INDEX "LandingPageVisit_workspaceId_createdAt_idx" ON "LandingPageVisit"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ScoringRule_workspaceId_idx" ON "ScoringRule"("workspaceId");

-- CreateIndex
CREATE INDEX "ScoreBand_workspaceId_idx" ON "ScoreBand"("workspaceId");

-- CreateIndex
CREATE INDEX "ScoringRun_workspaceId_startedAt_idx" ON "ScoringRun"("workspaceId", "startedAt");

-- CreateIndex
CREATE INDEX "Experiment_workspaceId_idx" ON "Experiment"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_workflowId_startedAt_idx" ON "WorkflowExecution"("workflowId", "startedAt");

-- CreateIndex
CREATE INDEX "WorkflowExecution_status_resumeAt_idx" ON "WorkflowExecution"("status", "resumeAt");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_createdAt_idx" ON "FormSubmission"("formId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

