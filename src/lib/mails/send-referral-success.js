import { sendLoggedEmail } from "./_shared";

export async function sendReferralSuccessEmail({ email, businessName, businessId, referralId, invitedBizName, totalReferrals }) {
    const uniqueKey = `referral-success-${referralId}`;
    const subject = `🚀 Davet Ettiğiniz İşletme Sisteme Katıldı`;

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#004aad;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#bfdbfe;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Büyümeye Devam Ediyoruz! 🚀</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Tebrikler <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Paylaştığınız davet linki işe yaradı! Sizin referansınız ile <strong>${invitedBizName}</strong> işletmesi Civardaki.com platformuna katıldı.
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:20px;border-radius:16px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0369a1;">Şu Ana Kadar Sisteme Kattığınız İşletme Sayısı</p>
        <p style="margin:0;font-size:40px;color:#004aad;font-weight:900;line-height:1;">${totalReferrals}</p>
      </div>

      <p style="margin:0 0 24px;font-size:14px;color:#475569;text-align:center;">
        Ağı büyütmeye devam edebilir, linkinizi paylaşarak yeni komşularınıza ulaşabilirsiniz.
      </p>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/dashboard" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:50px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
          DAVET LİNKİNİ PAYLAŞ 
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
        type: "EMAIL_SENT_REFERRAL_SUCCESS",
        businessId
    });
}
