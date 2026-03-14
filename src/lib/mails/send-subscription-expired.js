import { sendLoggedEmail } from "./_shared";

export async function sendSubscriptionExpiredEmail({ email, businessName, businessId, subscriptionId }) {
    const uniqueKey = `subscription-expired-${subscriptionId}`;
    const subject = `⚠️ Civardaki.com Panel Erişiminiz Durduruldu`;

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#dc2626;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#fecaca;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Abonelik Süresi Doldu</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Merhaba <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Civardaki.com işletme panelinizin kullanım süresi maalesef sona ermiştir. İşletmenizin halka açık vitrin profili yayınlanmaya devam ediyor, ancak:
      </p>

      <ul style="padding:0 0 0 20px;margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
        <li>Gelen müşteri taleplerini <strong style="color:#dc2626">göremezsiniz.</strong></li>
        <li>Ürün ve galeri gibi vitrin içeriklerinizi <strong style="color:#dc2626">düzenleyemezsiniz.</strong></li>
        <li>İşletme analiz ve istatistiklerine <strong style="color:#b91c1c">erişemezsiniz.</strong></li>
      </ul>

      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Kontrolü yeniden elinize almak ve müşteri fırsatlarını kaçırmamak için panel erişiminizi hemen yenileyin.
      </p>

      <div style="margin-top:28px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/billing" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 36px;border-radius:50px;box-shadow:0 4px 16px rgba(0,74,173,0.3);">
          PANELİ YENİDEN AÇ
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
        type: "EMAIL_SENT_SUBSCRIPTION_EXPIRED",
        businessId
    });
}
