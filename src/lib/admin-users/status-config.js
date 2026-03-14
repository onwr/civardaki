/**
 * Admin users: rol ve durum etiketleri / badge sınıfları
 * Kurumsal, yüksek kontrast: koyu metin açık zemin veya koyu zemin beyaz metin.
 */

export const roleConfig = {
  ADMIN: { label: "Yönetici", badgeClass: "bg-indigo-200 text-indigo-900 font-medium" },
  BUSINESS: { label: "İşletme", badgeClass: "bg-sky-200 text-sky-900 font-medium" },
  USER: { label: "Müşteri", badgeClass: "bg-slate-600 text-white font-medium" },
};

export const statusConfig = {
  ACTIVE: { label: "Aktif", badgeClass: "bg-emerald-200 text-emerald-900 font-medium" },
  SUSPENDED: { label: "Askıda", badgeClass: "bg-amber-200 text-amber-900 font-medium" },
  BANNED: { label: "Yasaklı", badgeClass: "bg-red-200 text-red-900 font-medium" },
  PENDING: { label: "Beklemede", badgeClass: "bg-slate-200 text-slate-800 font-medium" },
};

export function getRoleLabel(role) {
  return roleConfig[role]?.label ?? role ?? "—";
}

export function getRoleBadgeClass(role) {
  return roleConfig[role]?.badgeClass ?? "";
}

export function getStatusLabel(status) {
  return statusConfig[status]?.label ?? status ?? "—";
}

export function getStatusBadgeClass(status) {
  return statusConfig[status]?.badgeClass ?? "";
}
