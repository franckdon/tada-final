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
import { Logo } from "../components/logo";
import React = require("react");

interface InvoiceEmailProps {
  invoiceUrl: string;
  amount: string;
  date: string;
  locale: "fr" | "en";
}

const baseUrl = process.env.APP_URL || "";

const translations = {
  fr: {
    preview: "Votre facture est disponible",
    title: "Votre facture est disponible",
    description: "Vous trouverez ci-dessous les détails de votre facture.",
    button: "Voir ma facture",
    disclaimer:
      "Si vous n'êtes pas à l'origine de cette opération, vous pouvez ignorer cet email.",
    footer: "© {year} Tada. Tous droits réservés.",
    total: "Montant total",
    date: "Date",
  },
  en: {
    preview: "Your invoice is ready",
    title: "Your invoice is ready",
    description: "Below are the details of your invoice.",
    button: "View my invoice",
    disclaimer:
      "If you did not initiate this action, you can safely ignore this email.",
    footer: "© {year} Tadaiq. All rights reserved.",
    total: "Total amount",
    date: "Date",
  },
};

export const InvoiceEmail = ({
  invoiceUrl,
  amount,
  date,
  locale = "fr",
}: InvoiceEmailProps) => {
  const t = translations[locale] || translations.fr;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{t.preview}</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Logo baseUrl={baseUrl} />
          </Section>

          <Heading style={h1}>{t.title}</Heading>
          <Text style={heroText}>{t.description}</Text>

          <Text style={text}>
            <strong>{t.total}:</strong> {amount}
            <br />
            <strong>{t.date}:</strong> {date}
          </Text>

          <Section style={buttonContainer}>
            <Link href={invoiceUrl} style={button}>
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

InvoiceEmail.PreviewProps = {
  invoiceUrl: "https://example.com/invoice/123",
  amount: "59,99 €",
  date: "08/08/2025",
  locale: "fr",
} as InvoiceEmailProps;

export default InvoiceEmail;

// Styles
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
