-- CreateEnum pour les types de récompenses
CREATE TYPE "RewardType" AS ENUM ('credits', 'badge', 'bonus', 'discount');

-- CreateEnum pour le statut des récompenses
CREATE TYPE "RewardStatus" AS ENUM ('active', 'inactive', 'expired');

-- CreateTable pour les configurations de récompenses
CREATE TABLE "reward_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "RewardType" NOT NULL,
    "trigger" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'active',
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable pour l'historique des récompenses attribuées
CREATE TABLE "reward_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardConfigId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reward_config_status_idx" ON "reward_config"("status");
CREATE INDEX "reward_config_type_idx" ON "reward_config"("type");
CREATE INDEX "reward_history_userId_idx" ON "reward_history"("userId");
CREATE INDEX "reward_history_rewardConfigId_idx" ON "reward_history"("rewardConfigId");
CREATE INDEX "reward_history_awardedAt_idx" ON "reward_history"("awardedAt");

-- AddForeignKey
ALTER TABLE "reward_history" ADD CONSTRAINT "reward_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_history" ADD CONSTRAINT "reward_history_rewardConfigId_fkey" FOREIGN KEY ("rewardConfigId") REFERENCES "reward_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
