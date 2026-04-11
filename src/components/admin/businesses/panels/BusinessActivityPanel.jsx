"use client";

export default function BusinessActivityPanel({ analytics }) {
  const byType = analytics?.byType ?? {};
  const total = analytics?.total ?? 0;

  const labels = {
    VIEW_PROFILE: "Profil görüntüleme",
    VIEW_PRODUCT: "Ürün görüntüleme",
    CLICK_PHONE: "Telefon tıklama",
    CLICK_WHATSAPP: "WhatsApp tıklama",
    SUBMIT_LEAD: "Lead gönderimi",
    CLICK_CTA_PRIMARY: "CTA tıklama",
    CLICK_PHONE_STICKY: "Yapışkan telefon",
    SCROLL_75: "Kaydırma %75",
    CLICK_SHARE_PROFILE: "Profil paylaşım",
    CLICK_SHARE_REFERRAL: "Ortaklık paylaşımı",
    CLICK_REQUEST_REVIEW: "Yorum talebi",
  };

  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Toplam <strong>{total}</strong> etkileşim.
      </p>
      {entries.length === 0 ? (
        <p className="text-slate-500">Henüz etkileşim kaydı yok.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map(([type, count]) => (
            <li key={type} className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-slate-700">{labels[type] ?? type}</span>
              <span className="font-medium text-slate-900">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
