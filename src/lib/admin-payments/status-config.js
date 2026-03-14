/**
 * Admin payments (abonelik ödemeleri): durum etiketleri ve badge sınıfları
 */

export const subscriptionPaymentStatusConfig = {
  PENDING: { label: "Beklemede", badgeClass: "bg-amber-200 text-amber-900 font-medium" },
  COMPLETED: { label: "Tamamlandı", badgeClass: "bg-emerald-200 text-emerald-900 font-medium" },
  FAILED: { label: "Başarısız", badgeClass: "bg-red-200 text-red-900 font-medium" },
  REFUNDED: { label: "İade edildi", badgeClass: "bg-slate-200 text-slate-700 font-medium" },
};

const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

export function getStatusLabel(status) {
  return subscriptionPaymentStatusConfig[status]?.label ?? status ?? "—";
}

export function getStatusBadgeClass(status) {
  return subscriptionPaymentStatusConfig[status]?.badgeClass ?? "";
}

export { STATUSES };
