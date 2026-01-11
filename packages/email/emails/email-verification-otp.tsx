import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationOTPProps {
  otp: string;
  locale: string;
}

const baseUrl = process.env.APP_URL || "";

const translations = {
  fr: {
    preview: "Votre code de vérification Tada",
    title: "Vérifiez votre adresse email",
    description:
      "Voici votre code de vérification pour confirmer votre adresse email :",
    otpLabel: "Code de vérification",
    disclaimer:
      "Ce code expirera dans 5 minutes. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
    footer: "© {year} Tada. Tous droits réservés.",
  },
  en: {
    preview: "Your Tada verification code",
    title: "Verify your email address",
    description: "Here's your code to verify your email address:",
    otpLabel: "Verification code",
    disclaimer:
      "This code will expire in 5 minutes. If you didn't create an account, you can safely ignore this email.",
    footer: "© {year} Tada. All rights reserved.",
  },
};

export const EmailVerificationOTPEmail = ({
  otp,
  locale = "fr",
}: EmailVerificationOTPProps) => {
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

          <Section style={otpContainer}>
            <Text style={otpLabel}>{t.otpLabel}</Text>
            <Text style={otpCode}>{otp}</Text>
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

EmailVerificationOTPEmail.PreviewProps = {
  otp: "123456",
  locale: "fr",
} as EmailVerificationOTPProps;

export default EmailVerificationOTPEmail;

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

const otpContainer = {
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
  padding: "24px",
  marginBottom: "30px",
  textAlign: "center" as const,
};

const otpLabel = {
  fontSize: "14px",
  color: "#666666",
  marginBottom: "8px",
};

const otpCode = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1d1c1d",
  letterSpacing: "4px",
  margin: "0",
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
