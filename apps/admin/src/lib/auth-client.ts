import { adminClient, organizationClient } from "better-auth/client/plugins";
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

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!, // Optional if the API base URL matches the frontend
  appName: "Tada",
  plugins: [
    organizationClient(),
    adminClient({
      ac: ac,
      defaultRole: "contributor",
      adminRoles: ["superAdmin"],
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
} = authClient;
