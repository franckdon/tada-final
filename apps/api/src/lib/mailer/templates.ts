type BaseTemplateProps = {
  locale?: "fr" | "en";
};

function layout(content: string) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f7f9;
          padding: 20px;
        }
        .container {
          max-width: 480px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 24px;
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          text-align: center;
          margin: 24px 0;
        }
        .footer {
          font-size: 12px;
          color: #777;
          margin-top: 32px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
        <div class="footer">
          © ${new Date().getFullYear()} Tada — Ne pas répondre à cet email
        </div>
      </div>
    </body>
  </html>
  `;
}

export function verifyAccountOtpEmail(
  props: { otp: string; expiresInMinutes: number } & BaseTemplateProps,
) {
  return layout(`
    <h2>Confirmation de votre compte</h2>
    <p>Voici votre code de confirmation :</p>
    <div class="otp">${props.otp}</div>
    <p>
      Ce code est valable pendant <strong>${props.expiresInMinutes} minutes</strong>.
    </p>
    <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
  `);
}


export function resetPasswordOtpEmail(
  props: { otp: string; expiresInMinutes: number } & BaseTemplateProps,
) {
  return layout(`
    <h2>Réinitialisation du mot de passe</h2>
    <p>Utilisez le code suivant pour définir un nouveau mot de passe :</p>
    <div class="otp">${props.otp}</div>
    <p>
      Ce code expire dans <strong>${props.expiresInMinutes} minutes</strong>.
    </p>
  `);
}

export function invitationEmail(props: {
  invitedBy: string;
  organization: string;
  link: string;
}) {
  return layout(`
    <h2>Invitation à rejoindre ${props.organization}</h2>
    <p>${props.invitedBy} vous invite à rejoindre l’organisation.</p>
    <p>
      <a href="${props.link}">👉 Accepter l’invitation</a>
    </p>
  `);
}
