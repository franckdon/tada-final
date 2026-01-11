export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  maxMissions?: number;
  maxUsers?: number;
  maxResponses?: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
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
