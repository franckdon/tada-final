export type WorkspaceSubscriptionLite = {
  id: string;
  planCode: string;
  status: string; // active | inactive | ...
  startsAt: Date | string | null;
  endsAt: Date | string | null;
};

export type SubscriptionState = "none" | "inactive" | "active" | "expired" | "scheduled";

export type WorkspaceListItem = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  companySize: string | null;
  country: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  owner: { id: string; name: string; email: string } | null;

  organization:
    | { id: string; name: string; slug: string; status: string | null }
    | null;

  subscription: WorkspaceSubscriptionLite | null;

  // ✅ nouveau
  creditsBalance: number | null;

  // ✅ nouveaux états
  subscriptionState: SubscriptionState;
  isSubscriptionActive: boolean;
  isExpiringSoon: boolean;
};
