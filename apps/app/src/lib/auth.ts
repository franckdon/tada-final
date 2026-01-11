import { render } from "@react-email/render";
import { EmailVerificationEmail } from "@tada/email/emails/email-verification";
import { EmailVerificationOTPEmail } from "@tada/email/emails/email-verification-otp";
import { ForgotPasswordEmail } from "@tada/email/emails/forgot-password";
import { OrganizationInvitationEmail } from "@tada/email/emails/organization-invitation";
import { SignInOTPEmail } from "@tada/email/emails/sign-in-otp";
import { betterAuth } from "better-auth";
import { admin, emailOTP, organization } from "better-auth/plugins";
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

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const isLocal =
  process.env.NODE_ENV !== "production" ||
  appUrl.includes("localhost");
  
export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  appName: "Tada",
  trustedOrigins: [appUrl],
  user: {
    additionalFields: {
      position: {
        type: "string",
        required: false,
      },
      country: {
        type: "string",
        required: false,
      },
      sector: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
    ssl: {
    rejectUnauthorized: false,
    },
  }),
  plugins: [
    organization({
      ac: ac,
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
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign-in
          const payloadWithUnEscapedSubject = {
            from: "no-reply@monrezo.net",
            to: [email],
            subject: "[Tada] Votre code de connexion Tada",
            html: await render(
              SignInOTPEmail({
                otp,
                locale: "fr",
              }),
            ),
          };

          await transporter.sendMail(payloadWithUnEscapedSubject);
        } else if (type === "email-verification") {
          // Send the OTP for email verification
          const payloadWithUnEscapedSubject = {
            from: "no-reply@monrezo.net",
            to: [email],
            subject: "[Tada] Votre code de vérification Tada",
            html: await render(
              EmailVerificationOTPEmail({
                otp,
                locale: "fr",
              }),
            ),
          };

          await transporter.sendMail(payloadWithUnEscapedSubject);
        } else {
          // Send the OTP for password reset
        }
      },
    }),
  ],
  advanced: {
    cookiePrefix: "tada-session",
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }, request) => {

      // 🔥 En local : on log juste le lien au lieu d'envoyer un mail
      if (isLocal) {
        console.log("====================================");
        console.log("🔐 Email verification link (LOCAL) :");
        console.log(url);
        console.log("====================================");
        return;
      }

      const payloadWithUnEscapedSubject = {
        from: "no-reply@monrezo.net",
        to: [user?.email as string],
        subject: `[Tada] Confirmation d'inscription à ${user?.name}`,
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
