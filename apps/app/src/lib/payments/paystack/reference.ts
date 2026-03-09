import { randomUUID } from "crypto";

export function buildPaystackReference(input: {
  workspaceId: string;
  organizationId: string;
  purpose?: "workspace_credits";
}): string {
  const org = input.organizationId.replace(/-/g, "").slice(0, 4);
  const ws = input.workspaceId.replace(/-/g, "").slice(0, 4);
  const rand = randomUUID().replace(/-/g, "").slice(0, 12);

  return `tada_wc_${org}_${ws}_${rand}`;
}