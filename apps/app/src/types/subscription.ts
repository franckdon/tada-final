type SubscriptionFeature = {
  text: string;
  included: boolean;
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: SubscriptionFeature[] | any;
  maxMissions: number | null;
  maxUsers: number | null;
  maxResponses: number | null;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}

export interface UsageStats {
  missionsCreated: number;
  responsesCount: number;
  usersCount: number;
  limits: {
    maxMissions?: number;
    maxUsers?: number;
    maxResponses?: number;
  };
}
