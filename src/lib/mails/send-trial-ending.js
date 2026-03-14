import { sendLoggedEmail } from "./_shared";

export async function sendTrialEndingEmail({ email, businessName, businessId, daysLeft, expiresAt }) {
    const formattedDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(expiresAt);
    const uniqueKey = `trial-ending-${daysLeft}d-${businessId}`;
    const subject = `⏳ Civardaki.com Panel Kullanım Süreniz Bitmek Üzere`;

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#0a0a0a;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#475569;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Deneme Süreniz Bitiyor</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Merhaba <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Civardaki.com işletme panelinizi ücretsiz kullanabileceğiniz deneme sürenizin bitmesine <strong>${daysLeft} gün</strong> kaldı.
      </p>

      <div style="background:#f8fafc;border-left:4px solid #f59e0b;padding:16px;border-radius:0 12px 12px 0;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Kapanış Tarihi:</p>
        <p style="margin:0;font-size:15px;color:#b45309;font-weight:900;">${formattedDate}</p>
      </div>

      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Müşteri taleplerini (lead), yorumlarınızı ve işletme vitrininizi yönetmeye kesintisiz devam edebilmek için aboneliğinizi başlatabilirsiniz.
      </p>

      <div style="margin-top:28px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/billing" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(0,74,173,0.3);">
          ABONELİĞİ YENİLE 
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

    return sendLoggedEmail({
        to: email,
        subject,
        html,
        uniqueKey,
        type: "EMAIL_SENT_TRIAL_WARNING",
        businessId
    });
}
