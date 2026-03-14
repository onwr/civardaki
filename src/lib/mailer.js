/**
 * lib/mailer.js
 * Fire-and-forget email notification helper using Nodemailer.
 * Configure SMTP via environment variables (.env.local).
 *
 * Required env vars:
 *   SMTP_HOST     - e.g. srvc92.trwww.com | smtp.brevo.com
 *   SMTP_PORT     - 465 (SSL) veya 587 (TLS)
 *   SMTP_USER     - SMTP kullanıcı adı (genelde e-posta)
 *   SMTP_PASS     - SMTP şifresi
 *   SMTP_FROM     - Gönderen, örn. "Firma Kutusu <firmakutusu@heda.tr>"
 *   SMTP_SECURE   - "true" ise SSL (465) kullanılır, sertifika doğrulaması atlanabilir
 *   NEXT_PUBLIC_APP_URL - Uygulama URL (dashboard linkleri için)
 */

import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 587);
const useSecure = port === 465 || process.env.SMTP_SECURE === "true";

// 535 AUTH PLAIN hatası: sunucu LOGIN istiyor. auth.method + authMethod ile zorlanıyor.
const authMethod = (process.env.SMTP_AUTH_METHOD || "LOGIN").toUpperCase();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port || (useSecure ? 465 : 587),
  secure: useSecure,
  authMethod,
  auth: {
    method: authMethod,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_VERIFY_PEER === "true",
  },
});

/**
 * Send a lead notification email to the business owner.
 * Call with .catch(console.error) — never await in the API route.
 */
export async function sendLeadNotificationEmail({ business, lead }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("[mailer] SMTP not configured — skipping email.");
    return;
  }

  const recipientEmail = business.email;
  if (!recipientEmail) {
    console.warn("[mailer] Business has no email — skipping notification.");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";
  const dashboardUrl = `${appUrl}/business/dashboard`;

  const productLine = lead.productNameSnapshot
    ? `<tr><td style="padding:6px 0;color:#666;font-size:13px;"><strong>Ürün:</strong></td><td style="padding:6px 8px;font-size:13px;">${lead.productNameSnapshot}</td></tr>`
    : "";

  const phoneLine = lead.phone
    ? `<tr><td style="padding:6px 0;color:#666;font-size:13px;"><strong>Telefon:</strong></td><td style="padding:6px 8px;font-size:13px;">${lead.phone}</td></tr>`
    : "";

  const emailLine = lead.email
    ? `<tr><td style="padding:6px 0;color:#666;font-size:13px;"><strong>E-posta:</strong></td><td style="padding:6px 8px;font-size:13px;">${lead.email}</td></tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#0a0a0a;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#475569;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Yeni Müşteri Talebi 🎯</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 8px;font-size:14px;color:#475569;">Merhaba <strong>${business.name}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">civardaki.com üzerinden yeni bir müşteri talebi aldınız:</p>

      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:16px;overflow:hidden;padding:16px">
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px 16px;color:#666;font-size:13px;white-space:nowrap;width:120px;"><strong>Müşteri:</strong></td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${lead.name}</td>
          </tr>
          ${phoneLine}
          ${emailLine}
          ${productLine}
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:12px 16px;color:#666;font-size:13px;vertical-align:top;"><strong>Mesaj:</strong></td>
            <td style="padding:12px 16px;font-size:13px;color:#334155;font-style:italic;">"${lead.message}"</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:28px;text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:16px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(0,74,173,0.3);">
          Panele Git &amp; Yanıtla →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">Bu e-posta civardaki.com tarafından otomatik gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Civardaki.com" <noreply@civardaki.com>',
      to: recipientEmail,
      subject: `🎯 Yeni Talep: ${lead.name} — ${business.name}`,
      html,
    });
  } catch (error) {
    const { logError } = await import("./system");
    await logError("mailer", `Failed to send lead email to ${recipientEmail}`, error);
    throw error;
  }
}

/**
 * Send an email verification link to newly registered businesses.
 */
export async function sendVerificationEmail({ email, token }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("[mailer] SMTP not configured — skipping verification email.");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#004aad;padding:32px;text-align:center;">
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">E-posta Adresinizi Doğrulayın 🛡️</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Merhaba,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">Civardaki.com'a hoş geldiniz! İşletme panelinize tam erişim sağlamak ve hesabınızın güvenliğini doğrulamak için lütfen aşağıdaki butona tıklayın.</p>

      <div style="margin-top:28px;margin-bottom:28px;text-align:center;">
        <a href="${verifyUrl}" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(34,197,94,0.3);">
          HESABIMI DOĞRULA 
        </a>
      </div>
      
      <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Eğer butona tıklayamıyorsanız şu bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</p>
      <p style="margin:0 0 24px;font-size:12px;color:#004aad;word-break:break-all;">${verifyUrl}</p>
    </div>

    <div style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">Bu bağlantı 24 saat geçerlidir.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Civardaki.com Güvenlik" <noreply@civardaki.com>',
    to: email,
    subject: "🔒 Civardaki.com Hesabınızı Doğrulayın",
    html,
  });
}
