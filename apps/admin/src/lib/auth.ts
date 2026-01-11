import { render } from "@react-email/render";
import { EmailVerificationEmail } from "@tada/email/emails/email-verification";
import { ForgotPasswordEmail } from "@tada/email/emails/forgot-password";
import { OrganizationInvitationEmail } from "@tada/email/emails/organization-invitation";
import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { Pool } from "pg";
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
import { transporter } from "./transporter";

export const auth = betterAuth({
  baseURL: process.env.APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user, url }) => {
      const payloadWithUnEscapedSubject = {
        from: "no-reply@monrezo.net",
        to: [user?.email as string],
        subject: "[Tada] Réinitialisation de mot de passe",
        html: await render(
          ForgotPasswordEmail({
            resetUrl: url,
            locale: "fr",
          }),
        ),
      };

      await transporter.sendMail(payloadWithUnEscapedSubject);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      disableSignUp: true,
      disableImplicitSignUp: true,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      disableSignUp: true,
      disableImplicitSignUp: true,
    },
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  plugins: [
    organization({
      roles: {
        admin: organizationAdminPermissions,
        owner: organizationAdminPermissions,
        member: userOrganizationPermissions,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.APP_URL}/accept-invitation/${data.id}`;

        const payloadWithUnEscapedSubject = {
          from: "no-reply@monrezo.net",
          to: [data.email],
          subject: `[Tada] Invitation à rejoindre ${data.organization.name}`,
          html: await render(
            OrganizationInvitationEmail({
              inviteLink,
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              locale: "fr",
            }),
          ),
        };

        await transporter.sendMail(payloadWithUnEscapedSubject);
      },
    }),
    admin({
      ac: ac,
      impersonationSessionDuration: 60 * 60 * 24,
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
  advanced: {
    cookiePrefix: "tada-session-admin",
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const payloadWithUnEscapedSubject = {
        from: "no-reply@monrezo.net",
        to: [user?.email as string],
        subject: `[Tada] Confirmation d’inscription à ${user?.name}`,
        html: await render(
          EmailVerificationEmail({
            verificationUrl: url,
            locale: "fr",
          }),
        ),
      };

      await transporter.sendMail(payloadWithUnEscapedSubject);
    },
  },
});
