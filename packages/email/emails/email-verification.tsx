import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  verificationUrl: string;
  locale: string;
}

const baseUrl = process.env.APP_URL || "";

const translations = {
  fr: {
    preview: "Confirmez votre adresse email",
    title: "Confirmez votre adresse email",
    description:
      "Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.",
    button: "Confirmer mon email",
    disclaimer:
      "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
    footer: "© {year} Tada. Tous droits réservés.",
  },
  en: {
    preview: "Confirm your email address",
    title: "Confirm your email address",
    description:
      "Click the button below to confirm your email address and activate your account.",
    button: "Confirm my email",
    disclaimer:
      "If you didn't create an account, you can safely ignore this email.",
    footer: "© {year} Tada. All rights reserved.",
  },
};

export const EmailVerificationEmail = ({
  verificationUrl,
  locale = "fr",
}: EmailVerificationProps) => {
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
            <Link href={verificationUrl} style={button}>
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

EmailVerificationEmail.PreviewProps = {
  verificationUrl: "https://example.com/verify-email?token=123",
  locale: "fr",
} as EmailVerificationProps;

export default EmailVerificationEmail;

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
