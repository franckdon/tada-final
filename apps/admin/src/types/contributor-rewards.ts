// apps/admin/src/types/contributor-rewards.ts

export interface ContributorModuleRewardConfigRow {
  id: string;
  moduleKey: string;
  moduleLabel: string;
  order: number;
  rewardXof: number;
  isActive: boolean;
  dependsOn: string | null;
  createdAt: string;
  updatedAt: string;
}
