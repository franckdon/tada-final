import { randomUUID } from "crypto";

export function buildPaystackReference(input: {
  workspaceId: string;
  organizationId: string;
  purpose?: "workspace_credits";
}): string {
  const purpose = input.purpose ?? "workspace_credits";

  const uuid = randomUUID().replace(/-/g, "");
  const ws = input.workspaceId.replace(/-/g, "").slice(0, 8);
  const org = input.organizationId.replace(/-/g, "").slice(0, 8);

  return `tada_${purpose}_${org}_${ws}_${uuid}`;
}
