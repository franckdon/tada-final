// apps/app/src/lib/auth-client.ts
import {
  adminClient,
  emailOTPClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  ac,
  contentModerator,
  contributor,
  externalAuditor,
  financialAdmin,
  operationsAdmin,
  organizationAdmin,
  superAdmin,
  userOrganization,
} from "./permissions";
import {
  organizationAdminPermissions,
  userOrganizationPermissions,
} from "./permissions-organization";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  appName: "Tada",
  plugins: [
    emailOTPClient(),
    organizationClient({
      ac: ac,
      roles: {
        admin: organizationAdminPermissions,
        owner: organizationAdminPermissions,
        member: userOrganizationPermissions,
      },
    }),
    adminClient({
      ac: ac,
      defaultRole: "organizationAdmin",
      adminRoles: ["superAdmin", "organizationAdmin"],
      roles: {
        superAdmin,
        operationsAdmin,
        contentModerator,
        financialAdmin,
        externalAuditor,
        organizationAdmin,
        userOrganization,
        contributor,
      },
    }),
  ],
});

export const {
  signIn,
  signOut,
  useSession,
  signUp,
  organization,
  forgetPassword,
  resetPassword,
  admin,
} = authClient;
