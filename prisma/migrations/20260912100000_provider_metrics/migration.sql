-- CreateTable
CREATE TABLE "ProviderMetricDaily" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dimension" TEXT NOT NULL DEFAULT '',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT,
    "meta" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderMetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderMetricDaily_workspaceId_date_idx" ON "ProviderMetricDaily"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderMetricDaily_workspaceId_provider_metric_date_dimens_key" ON "ProviderMetricDaily"("workspaceId", "provider", "metric", "date", "dimension");

