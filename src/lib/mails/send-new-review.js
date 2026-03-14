import { sendLoggedEmail } from "./_shared";

export async function sendNewReviewEmail({ email, businessName, businessId, reviewId, rating, content, businessSlug }) {
    const uniqueKey = `review-approved-${reviewId}`;
    const subject = `⭐ İşletmeniz İçin Yeni Bir Değerlendirme Yayınlandı`;

    // Create visual stars
    const starsHtml = Array.from({ length: 5 }).map((_, i) =>
        i < rating
            ? '<span style="color:#fbbf24;font-size:24px;">★</span>'
            : '<span style="color:#e2e8f0;font-size:24px;">★</span>'
    ).join('');

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <div style="background:#0f172a;padding:32px;text-align:center;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.2em;color:#94a3b8;text-transform:uppercase;">Civardaki.com</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Yeni Müşteri Onayı ✨</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">Tebrikler <strong>${businessName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#475569;">
        Bir müşteriniz vitrininiz üzerinden size <strong>${rating} yıldızlı</strong> bir değerlendirme bıraktı. Yorum moderasyon sürecinden başarıyla geçerek sayfanızda yayınlanmaya başladı.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px;border-radius:16px;text-align:center;margin-bottom:28px;">
        <div style="margin-bottom:16px;line-height:1;">
          ${starsHtml}
        </div>
        <p style="margin:0;font-size:15px;color:#334155;font-style:italic;line-height:1.6;">
          "${content}"
        </p>
      </div>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${businessSlug}" style="display:inline-block;background:#004aad;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:50px;box-shadow:0 4px 16px rgba(0,74,173,0.3);">
          YORUMU GÖR 
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
        type: "EMAIL_SENT_NEW_REVIEW",
        businessId
    });
}
