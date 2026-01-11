import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  user: ["create", "read", "update", "delete", "manage", "assign_roles"],
  mission: ["create", "read", "update", "delete", "validate"],
  organization: ["manage", "read", "create", "delete"],
  task: ["moderate", "validate", "block", "read"],
  finance: ["manage_payments", "view_reports", "manage_billing"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  contributor: ["manage", "read"],
} as const;

export const ac = createAccessControl(statement);

// SUPER_ADMIN - Full access to everything
export const superAdmin = ac.newRole({
  ...adminAc.statements,
  user: ["create", "read", "update", "delete", "manage", "assign_roles"],
  mission: ["create", "read", "update", "delete", "validate"],
  organization: ["manage", "read", "create", "delete"],
  task: ["moderate", "validate", "block", "read"],
  finance: ["manage_payments", "view_reports", "manage_billing"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  contributor: ["manage", "read"],
});

// OPERATIONS_ADMIN
export const operationsAdmin = ac.newRole({
  mission: ["create", "read", "update", "delete", "validate"],
  contributor: ["manage", "read"],
  task: ["validate"],
  finance: ["manage_payments"],
});

export const organizationAdmin = ac.newRole({
  user: ["manage"],
  organization: ["manage", "read"],
  mission: ["read", "create", "update", "delete"],
  finance: ["manage_billing"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  task: ["read"],
});

// USER_ORGANIZATION
export const userOrganization = ac.newRole({
  mission: ["update", "read"],
  support: ["manage_tickets", "view"],
  analytics: ["view_dashboards", "export_data"],
  task: ["read"],
});

// CONTENT_MODERATOR
export const contentModerator = ac.newRole({
  task: ["moderate", "validate", "block"],
  mission: ["read"],
});

// FINANCIAL_ADMIN
export const financialAdmin = ac.newRole({
  finance: ["manage_payments", "view_reports", "manage_billing"],
});

// EXTERNAL_AUDITOR
export const externalAuditor = ac.newRole({
  analytics: ["view_dashboards"],
  finance: ["view_reports"],
});

// CONTRIBUTOR
export const contributor = ac.newRole({
  mission: ["read"],
});
