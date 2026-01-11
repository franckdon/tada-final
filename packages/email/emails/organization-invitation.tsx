import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrganizationInvitationProps {
  inviteLink: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  locale?: string;
}

const baseUrl = process.env.APP_URL || "";

const translations = {
  fr: {
    preview: "Invitation à rejoindre {teamName}",
    title: "Vous avez été invité à rejoindre {teamName}",
    description:
      "{invitedByUsername} ({invitedByEmail}) vous invite à rejoindre l'équipe {teamName} sur Tada.",
    button: "Accepter l'invitation",
    disclaimer:
      "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.",
    footer: "© {year} Tada. Tous droits réservés.",
  },
  en: {
    preview: "Invitation to join {teamName}",
    title: "You've been invited to join {teamName}",
    description:
      "{invitedByUsername} ({invitedByEmail}) has invited you to join the {teamName} team on Tada.",
    button: "Accept invitation",
    disclaimer:
      "If you weren't expecting this invitation, you can safely ignore this email.",
    footer: "© {year} Tada. All rights reserved.",
  },
};

export const OrganizationInvitationEmail = ({
  inviteLink,
  invitedByUsername,
  invitedByEmail,
  teamName,
  locale = "fr",
}: OrganizationInvitationProps) => {
  const t =
    translations[locale as keyof typeof translations] || translations.fr;

  const replaceVariables = (text: string) => {
    return text
      .replace("{teamName}", teamName)
      .replace("{invitedByUsername}", invitedByUsername)
      .replace("{invitedByEmail}", invitedByEmail)
      .replace("{year}", new Date().getFullYear().toString());
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{replaceVariables(t.preview)}</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/logo-group.png`}
              width="120"
              height="36"
              alt="Tada"
            />
          </Section>
          <Heading style={h1}>{replaceVariables(t.title)}</Heading>
          <Text style={heroText}>{replaceVariables(t.description)}</Text>

          <Section style={buttonContainer}>
            <Link href={inviteLink} style={button}>
              {t.button}
            </Link>
          </Section>

          <Text style={text}>{t.disclaimer}</Text>

          <Section>
            <Text style={footerText}>{replaceVariables(t.footer)}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles (mêmes styles que email-verification.tsx)
const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "36px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "30px",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#FF5B4A",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
  marginBottom: "50px",
};

export default OrganizationInvitationEmail;
