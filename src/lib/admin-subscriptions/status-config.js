/**
 * Admin subscriptions: plan ve durum etiketleri / badge sınıfları
 */

export const planConfig = {
  BASIC: { label: "Temel", badgeClass: "bg-slate-200 text-slate-900 font-medium" },
  PREMIUM: { label: "Premium", badgeClass: "bg-amber-200 text-amber-900 font-medium" },
};

export const statusConfig = {
  TRIAL: { label: "Deneme", badgeClass: "bg-blue-200 text-blue-900 font-medium" },
  ACTIVE: { label: "Aktif", badgeClass: "bg-emerald-200 text-emerald-900 font-medium" },
  EXPIRED: { label: "Süresi doldu", badgeClass: "bg-red-200 text-red-900 font-medium" },
};

export function getPlanLabel(plan) {
  return planConfig[plan]?.label ?? plan ?? "—";
}

export function getPlanBadgeClass(plan) {
  return planConfig[plan]?.badgeClass ?? "";
}

export function getStatusLabel(status) {
  return statusConfig[status]?.label ?? status ?? "—";
}

export function getStatusBadgeClass(status) {
  return statusConfig[status]?.badgeClass ?? "";
}
