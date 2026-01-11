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

interface ForgotPasswordEmailProps {
  resetUrl: string;
  locale: string;
}

const baseUrl = process.env.APP_URL || "";

const translations = {
  fr: {
    preview: "Réinitialiser votre mot de passe",
    title: "Réinitialiser votre mot de passe",
    description:
      "Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expirera dans 24 heures.",
    button: "Réinitialiser mon mot de passe",
    disclaimer:
      "Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email en toute sécurité.",
    footer: "© {year} Tada. Tous droits réservés.",
  },
  en: {
    preview: "Reset your password",
    title: "Reset your password",
    description:
      "Click the button below to reset your password. This link will expire in 24 hours.",
    button: "Reset my password",
    disclaimer:
      "If you didn't request a password reset, you can safely ignore this email.",
    footer: "© {year} Tada. All rights reserved.",
  },
};

export const ForgotPasswordEmail = ({
  resetUrl,
  locale = "fr",
}: ForgotPasswordEmailProps) => {
  const t =
    translations[locale as keyof typeof translations] || translations.fr;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{t.preview}</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/logo-group.png`}
              width="120"
              height="36"
              alt="Tada"
            />
          </Section>
          <Heading style={h1}>{t.title}</Heading>
          <Text style={heroText}>{t.description}</Text>

          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              {t.button}
            </Link>
          </Section>

          <Text style={text}>{t.disclaimer}</Text>

          <Section>
            <Text style={footerText}>
              {t.footer.replace("{year}", new Date().getFullYear().toString())}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ForgotPasswordEmail.PreviewProps = {
  resetUrl: "https://example.com/reset-password?token=123",
  locale: "fr",
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;

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
