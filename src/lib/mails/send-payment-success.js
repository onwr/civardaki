import { sendLoggedEmail } from "./_shared";

export async function sendPaymentSuccessEmail({ email, businessName, businessId, planName, expiresAt, subscriptionId }) {
    const formattedDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(expiresAt);
    const uniqueKey = `payment-success-${subscriptionId}`;
    const subject = `✅ Ödemeniz Alındı, Paneliniz Aktif Edildi`;

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#22c55e;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#dcfce7;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Panel Aboneliği Onaylandı</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Merhaba <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Ödemeniz başarıyla tarafımıza ulaşıp onaylandı. Civardaki.com işletme paneliniz kullanıma hazırdır. 
      </p>

      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px 16px;color:#64748b;font-size:13px;"><strong>Plan:</strong></td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${planName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#64748b;font-size:13px;"><strong>Bitiş Tarihi:</strong></td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;">${formattedDate}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:28px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/dashboard" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
          PANELE GİT 
        </a>
      </div>
      
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
    </div>
  </div>
</body>
</html>`;

    return sendLoggedEmail({
        to: email,
        subject,
        html,
        uniqueKey,
        type: "EMAIL_SENT_PAYMENT_SUCCESS",
        businessId
    });
}
