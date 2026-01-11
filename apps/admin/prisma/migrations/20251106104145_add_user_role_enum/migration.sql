-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('in_progress', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('system_admin', 'client_admin', 'contributor', 'validator');

-- CreateEnum
CREATE TYPE "ValidationAction" AS ENUM ('approved', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "QualityStatus" AS ENUM ('pending', 'analyzing', 'accepted', 'review_required', 'rejected');

-- CreateEnum
CREATE TYPE "QualityIssueType" AS ENUM ('response_consistency', 'media_quality', 'geographic_validity', 'temporal_integrity', 'data_completeness', 'suspicious_pattern');

-- CreateEnum
CREATE TYPE "QualityIssueLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'contributor',
    "position" TEXT,
    "country" TEXT,
    "sector" TEXT,
    "image" TEXT,
    "kyc_status" "KycStatus",
    "job" TEXT,
    "location" TEXT,
    "banned" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,
    "status" TEXT,
    "country" TEXT,
    "sector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questions" JSONB,
    "type" TEXT,
    "internal" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "problemSummary" TEXT,
    "objectives" TEXT,
    "assumptions" TEXT,
    "audiences" JSONB,
    "organizationId" TEXT,
    "status" TEXT,
    "updatedType" TEXT,
    "type" TEXT,
    "internal" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "isPublish" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdminMission" BOOLEAN NOT NULL DEFAULT false,
    "executiveSummary" TEXT,
    "executiveSummaryUpdatedAt" TIMESTAMP(3),
    "enrichmentAttributes" JSONB NOT NULL DEFAULT '[]',
    "isEnrichmentMission" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_config_contributor" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gain" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3),
    "missionId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "mission_config_contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "missionId" TEXT,
    "questions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_response" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "survey_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "missionId" TEXT,
    "name" TEXT,
    "tadaName" TEXT,
    "dashboardTitle" TEXT,
    "description" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#103751',
    "titleColor" TEXT NOT NULL DEFAULT 'white',
    "headerCode" TEXT,
    "footerCode" TEXT,
    "logo" TEXT,
    "logoLink" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "timezone" TEXT,
    "ghost" BOOLEAN NOT NULL DEFAULT false,
    "updateSchedule" JSONB,
    "snapshotSchedule" JSONB,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSnapshotSentAt" TIMESTAMP(3),
    "currentSnapshot" TEXT,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_filter" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "onReport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_role" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "subType" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "shareable" BOOLEAN NOT NULL DEFAULT false,
    "chartData" JSONB,
    "chartDataUpdated" TIMESTAMP(3),
    "chartSize" INTEGER NOT NULL DEFAULT 2,
    "dashboardOrder" INTEGER,
    "displayLegend" BOOLEAN NOT NULL DEFAULT false,
    "pointRadius" INTEGER,
    "dataLabels" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dateVarsFormat" TEXT,
    "includeZeros" BOOLEAN NOT NULL DEFAULT true,
    "currentEndDate" BOOLEAN NOT NULL DEFAULT false,
    "fixedStartDate" BOOLEAN NOT NULL DEFAULT false,
    "timeInterval" TEXT NOT NULL DEFAULT 'day',
    "autoUpdate" INTEGER,
    "lastAutoUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "mode" TEXT NOT NULL DEFAULT 'chart',
    "maxValue" INTEGER,
    "minValue" INTEGER,
    "disabledExport" BOOLEAN,
    "onReport" BOOLEAN NOT NULL DEFAULT true,
    "xLabelTicks" TEXT NOT NULL DEFAULT 'default',
    "stacked" BOOLEAN NOT NULL DEFAULT false,
    "horizontal" BOOLEAN NOT NULL DEFAULT false,
    "showGrowth" BOOLEAN NOT NULL DEFAULT false,
    "invertGrowth" BOOLEAN NOT NULL DEFAULT false,
    "layout" JSONB NOT NULL DEFAULT '{"lg":[0,0,6,2],"md":[0,0,6,2],"sm":[0,0,4,2],"xs":[0,0,4,2],"xxs":[0,0,2,2]}',
    "snapshotToken" TEXT NOT NULL,
    "isLogarithmic" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "ranges" JSONB,
    "dashedLastPoint" BOOLEAN NOT NULL DEFAULT false,
    "chartSpec" JSONB,

    CONSTRAINT "chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_share" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "shareString" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectIds" JSONB,
    "chartId" TEXT,
    "connectionId" TEXT,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "query" TEXT,
    "xAxis" TEXT,
    "xAxisOperation" TEXT,
    "yAxis" TEXT,
    "yAxisOperation" TEXT DEFAULT 'none',
    "dateField" TEXT,
    "dateFormat" TEXT,
    "legend" TEXT,
    "conditions" JSONB,
    "formula" TEXT,
    "fieldsSchema" TEXT,
    "excludedFields" JSONB,
    "averageByTotal" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB,
    "joinSettings" JSONB,
    "mainDrId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_dataset_config" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "formula" TEXT,
    "datasetColor" TEXT,
    "fillColor" JSONB,
    "fill" BOOLEAN NOT NULL DEFAULT false,
    "multiFill" BOOLEAN NOT NULL DEFAULT false,
    "legend" TEXT,
    "pointRadius" INTEGER,
    "excludedFields" JSONB,
    "sort" TEXT,
    "columnsOrder" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "maxRecords" INTEGER,
    "goal" INTEGER,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_dataset_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_dashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_dashboard_item" (
    "id" TEXT NOT NULL,
    "subDashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "surveyKey" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_dashboard_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "interval" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "maxMissions" INTEGER,
    "maxUsers" INTEGER,
    "maxResponses" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "problemSummary" TEXT,
    "objectives" TEXT,
    "assumptions" TEXT,
    "audiences" JSONB,
    "status" TEXT,
    "updatedType" TEXT,
    "type" TEXT,
    "internal" BOOLEAN DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "missionId" TEXT NOT NULL,

    CONSTRAINT "temp_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_sub_dashboard" (
    "id" TEXT NOT NULL,
    "tempMissionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_sub_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_sub_dashboard_item" (
    "id" TEXT NOT NULL,
    "tempSubDashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "surveyKey" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_sub_dashboard_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulted_mission" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "consultedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consulted_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_info" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "country" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "civility" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "acceptTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_assignment" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_comment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "action" "ValidationAction" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatorId" TEXT NOT NULL,
    "surveyResponseId" TEXT,

    CONSTRAINT "validation_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_control" (
    "id" TEXT NOT NULL,
    "surveyResponseId" TEXT NOT NULL,
    "status" "QualityStatus" NOT NULL DEFAULT 'pending',
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "consistencyScore" DOUBLE PRECISION,
    "mediaScore" DOUBLE PRECISION,
    "geoScore" DOUBLE PRECISION,
    "temporalScore" DOUBLE PRECISION,
    "completenessScore" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3),
    "analyzer" TEXT,
    "analyzerVersion" TEXT,
    "summary" TEXT,
    "recommendations" JSONB,
    "decision" TEXT,
    "decisionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_issue" (
    "id" TEXT NOT NULL,
    "qualityControlId" TEXT NOT NULL,
    "type" "QualityIssueType" NOT NULL,
    "level" "QualityIssueLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fieldPath" TEXT,
    "expectedValue" TEXT,
    "actualValue" TEXT,
    "impactScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_metric" (
    "id" TEXT NOT NULL,
    "qualityControlId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_entry" (
    "id" TEXT NOT NULL,
    "qualityControlId" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "originalDecision" TEXT,
    "correctedDecision" TEXT,
    "explanation" TEXT,
    "providedBy" TEXT,
    "confidence" DOUBLE PRECISION,
    "impactOnModel" BOOLEAN NOT NULL DEFAULT false,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_pattern" (
    "id" TEXT NOT NULL,
    "patternName" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "threshold" DOUBLE PRECISION,
    "severity" "QualityIssueLevel" NOT NULL,
    "detectionCount" INTEGER NOT NULL DEFAULT 0,
    "falsePositiveRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_configuration" (
    "id" TEXT NOT NULL,
    "configType" TEXT NOT NULL,
    "configName" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_analysis_log" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "surveyResponseId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "analyzer" TEXT NOT NULL,
    "analyzerVersion" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "promptTokensUsed" INTEGER,
    "responseTokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "configSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_analysis_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_chart" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "surveyId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT,
    "chartData" JSONB NOT NULL,
    "filters" JSONB,
    "title" TEXT,
    "description" TEXT,
    "insights" JSONB,
    "insightsUpdatedAt" TIMESTAMP(3),
    "public" BOOLEAN NOT NULL DEFAULT false,
    "shareable" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "dashboardOrder" INTEGER,
    "layout" JSONB,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_data" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionType" TEXT,
    "originalQuestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "enrichmentOnly" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audience_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_attribute_value" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConsultedSuperAdminMissions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConsultedSuperAdminMissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_tadaName_key" ON "project"("tadaName");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_organizationId_key" ON "subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "temp_mission_missionId_key" ON "temp_mission"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "consulted_mission_organizationId_missionId_key" ON "consulted_mission"("organizationId", "missionId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_info_organizationId_key" ON "billing_info"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "mission_assignment_missionId_contributorId_key" ON "mission_assignment"("missionId", "contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "quality_control_surveyResponseId_key" ON "quality_control"("surveyResponseId");

-- CreateIndex
CREATE INDEX "quality_metric_metricName_metricType_idx" ON "quality_metric"("metricName", "metricType");

-- CreateIndex
CREATE UNIQUE INDEX "quality_pattern_patternName_key" ON "quality_pattern"("patternName");

-- CreateIndex
CREATE UNIQUE INDEX "quality_configuration_configType_configName_version_key" ON "quality_configuration"("configType", "configName", "version");

-- CreateIndex
CREATE INDEX "quality_analysis_log_batchId_idx" ON "quality_analysis_log"("batchId");

-- CreateIndex
CREATE INDEX "quality_analysis_log_surveyResponseId_idx" ON "quality_analysis_log"("surveyResponseId");

-- CreateIndex
CREATE INDEX "quality_analysis_log_analyzer_analyzerVersion_idx" ON "quality_analysis_log"("analyzer", "analyzerVersion");

-- CreateIndex
CREATE INDEX "contributor_data_key_idx" ON "contributor_data"("key");

-- CreateIndex
CREATE INDEX "contributor_data_missionId_idx" ON "contributor_data"("missionId");

-- CreateIndex
CREATE INDEX "contributor_data_userId_idx" ON "contributor_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_data_missionId_userId_key_key" ON "contributor_data"("missionId", "userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "audience_attribute_key_key" ON "audience_attribute"("key");

-- CreateIndex
CREATE INDEX "audience_attribute_category_idx" ON "audience_attribute"("category");

-- CreateIndex
CREATE INDEX "audience_attribute_active_idx" ON "audience_attribute"("active");

-- CreateIndex
CREATE INDEX "contributor_attribute_value_userId_idx" ON "contributor_attribute_value"("userId");

-- CreateIndex
CREATE INDEX "contributor_attribute_value_attributeId_idx" ON "contributor_attribute_value"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_attribute_value_attributeId_userId_key" ON "contributor_attribute_value"("attributeId", "userId");

-- CreateIndex
CREATE INDEX "_ConsultedSuperAdminMissions_B_index" ON "_ConsultedSuperAdminMissions"("B");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_config_contributor" ADD CONSTRAINT "mission_config_contributor_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_filter" ADD CONSTRAINT "dashboard_filter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_role" ADD CONSTRAINT "project_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_role" ADD CONSTRAINT "project_role_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart" ADD CONSTRAINT "chart_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_share" ADD CONSTRAINT "chart_share_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset" ADD CONSTRAINT "dataset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset" ADD CONSTRAINT "dataset_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variable" ADD CONSTRAINT "variable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_dataset_config" ADD CONSTRAINT "chart_dataset_config_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_dataset_config" ADD CONSTRAINT "chart_dataset_config_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "dataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_dashboard" ADD CONSTRAINT "sub_dashboard_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_dashboard" ADD CONSTRAINT "sub_dashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_dashboard_item" ADD CONSTRAINT "sub_dashboard_item_subDashboardId_fkey" FOREIGN KEY ("subDashboardId") REFERENCES "sub_dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_mission" ADD CONSTRAINT "temp_mission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_sub_dashboard" ADD CONSTRAINT "temp_sub_dashboard_tempMissionId_fkey" FOREIGN KEY ("tempMissionId") REFERENCES "temp_mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_sub_dashboard_item" ADD CONSTRAINT "temp_sub_dashboard_item_tempSubDashboardId_fkey" FOREIGN KEY ("tempSubDashboardId") REFERENCES "temp_sub_dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulted_mission" ADD CONSTRAINT "consulted_mission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulted_mission" ADD CONSTRAINT "consulted_mission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_info" ADD CONSTRAINT "billing_info_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignment" ADD CONSTRAINT "mission_assignment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignment" ADD CONSTRAINT "mission_assignment_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_assignment" ADD CONSTRAINT "mission_assignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_comment" ADD CONSTRAINT "validation_comment_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_comment" ADD CONSTRAINT "validation_comment_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "survey_response"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_control" ADD CONSTRAINT "quality_control_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "survey_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_issue" ADD CONSTRAINT "quality_issue_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "quality_control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_metric" ADD CONSTRAINT "quality_metric_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "quality_control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_entry" ADD CONSTRAINT "feedback_entry_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "quality_control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_chart" ADD CONSTRAINT "mission_chart_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_chart" ADD CONSTRAINT "mission_chart_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_data" ADD CONSTRAINT "contributor_data_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_data" ADD CONSTRAINT "contributor_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_attribute_value" ADD CONSTRAINT "contributor_attribute_value_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "audience_attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_attribute_value" ADD CONSTRAINT "contributor_attribute_value_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultedSuperAdminMissions" ADD CONSTRAINT "_ConsultedSuperAdminMissions_A_fkey" FOREIGN KEY ("A") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultedSuperAdminMissions" ADD CONSTRAINT "_ConsultedSuperAdminMissions_B_fkey" FOREIGN KEY ("B") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
