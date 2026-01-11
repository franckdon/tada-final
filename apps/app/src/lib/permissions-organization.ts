import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  mission: ["create", "read", "update", "delete", "validate"],
  organization: ["manage", "read", "create", "delete"],
  task: ["moderate", "validate", "block", "read"],
  finance: ["manage_payments", "view_reports", "manage_billing"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
} as const;

export const ac = createAccessControl(statement);

export const organizationAdminPermissions = ac.newRole({
  ...adminAc.statements,
  organization: ["manage", "read"],
  mission: ["read", "create", "update", "delete"],
  finance: ["manage_billing"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  task: ["read"],
});

// USER_ORGANIZATION
export const userOrganizationPermissions = ac.newRole({
  mission: ["update", "read"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  task: ["read"],
});
