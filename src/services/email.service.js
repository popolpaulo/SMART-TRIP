const https = require('https');
const logger = require('../utils/logger');

// Envoie un email via l'API HTTP Brevo (HTTPS port 443 — jamais bloqué sur Railway)
const sendBrevoEmail = (to, subject, htmlContent, toName) => {
  return new Promise((resolve, reject) => {
    const from = process.env.SMTP_FROM || 'theo.garnier681@gmail.com';
    const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;

    const body = JSON.stringify({
      sender: { name: 'SMART TRIP', email: from },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Générer un code de vérification à 6 chiffres
exports.generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Envoyer un email de vérification
exports.sendVerificationEmail = async (email, code, firstName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bienvenue sur SMART TRIP, ${firstName} !</h2>
        <p>Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>Ce code est valable pendant 15 minutes.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">SMART TRIP - Votre comparateur de vols intelligent</p>
      </div>
    `;

    const result = await sendBrevoEmail(email, 'Vérification de votre compte SMART TRIP', htmlContent, firstName);
    logger.info(`Email de vérification envoyé à ${email} - MessageID: ${result.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Erreur envoi email à ${email}:`, error.message);
    throw error;
  }
};

// Envoyer un email de réinitialisation de mot de passe
exports.sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
        <p>Bonjour ${firstName},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="color: #2563eb; word-break: break-all;">${resetLink}</p>
        <p style="color: #ef4444; margin-top: 20px;">Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">SMART TRIP - Votre comparateur de vols intelligent</p>
      </div>
    `;

    await sendBrevoEmail(email, 'Réinitialisation de votre mot de passe SMART TRIP', htmlContent, firstName);
    logger.info(`Email de réinitialisation envoyé à ${email}`);
    return true;
  } catch (error) {
    logger.error(`Erreur envoi email à ${email}:`, error);
    return false;
  }
};
