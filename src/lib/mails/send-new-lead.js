import { sendLoggedEmail } from "./_shared";

export async function sendNewLeadEmail({ email, businessName, businessId, leadId, leadName, leadPhone, leadEmail, leadProduct, leadMessage }) {
    const uniqueKey = `lead-created-${leadId}`;
    const subject = `🎯 Yeni Bir Müşteri Talebiniz Var`;

    const productHtml = leadProduct ? `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#64748b;font-size:13px;width:100px;"><strong>İlgili Ürün:</strong></td>
        <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${leadProduct}</td>
      </tr>` : "";

    const phoneHtml = leadPhone ? `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#64748b;font-size:13px;"><strong>Telefon:</strong></td>
        <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${leadPhone}</td>
      </tr>` : "";

    const emailHtml = leadEmail ? `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#64748b;font-size:13px;"><strong>E-posta:</strong></td>
        <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${leadEmail}</td>
      </tr>` : "";

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#0a0a0a;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#475569;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Yeni Müşteri Talebi 🎯</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Merhaba <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Profiliniz üzerinden yeni bir müşteri sizinle iletişime geçmek istiyor. Talebi hemen inceleyerek müşteriye dönüş yapabilirsiniz.
      </p>

      <div style="background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:12px 16px;color:#64748b;font-size:13px;width:100px;"><strong>Müşteri:</strong></td>
              <td style="padding:12px 16px;font-size:13px;font-weight:900;color:#0f172a;">${leadName}</td>
            </tr>
            ${phoneHtml}
            ${emailHtml}
            ${productHtml}
            <tr>
              <td style="padding:12px 16px;color:#64748b;font-size:13px;vertical-align:top;"><strong>Mesaj:</strong></td>
              <td style="padding:12px 16px;font-size:13px;color:#1e293b;font-style:italic;">"${leadMessage}"</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/ व्यवसाय/leads" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:50px;box-shadow:0 4px 16px rgba(0,74,173,0.3);">
          TALEBİ GÖR 
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Replace the Indian translation snippet inadvertently injected into URL
    const fixedHtml = html.replace('/ \u0935\u094D\u092F\u0935\u0938\u093E\u092F/leads', '/business/leads');

    return sendLoggedEmail({
        to: email,
        subject,
        html: fixedHtml,
        uniqueKey,
        type: "EMAIL_SENT_NEW_LEAD",
        businessId
    });
}
