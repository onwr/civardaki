/**
 * Admin invoices: fatura tipi ve durum etiketleri / badge sınıfları
 */

export const invoiceTypeConfig = {
  SUBSCRIPTION: { label: "Abonelik", badgeClass: "bg-blue-200 text-blue-900 font-medium" },
  MANUAL: { label: "Manuel", badgeClass: "bg-slate-200 text-slate-800 font-medium" },
  OTHER: { label: "Diğer", badgeClass: "bg-slate-200 text-slate-600 font-medium" },
};

export const invoiceStatusConfig = {
  DRAFT: { label: "Taslak", badgeClass: "bg-amber-200 text-amber-900 font-medium" },
  ISSUED: { label: "Kesildi", badgeClass: "bg-blue-200 text-blue-900 font-medium" },
  PAID: { label: "Ödendi", badgeClass: "bg-emerald-200 text-emerald-900 font-medium" },
  CANCELLED: { label: "İptal", badgeClass: "bg-red-200 text-red-900 font-medium" },
};

const TYPES = ["SUBSCRIPTION", "MANUAL", "OTHER"];
const STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"];

export function getTypeLabel(type) {
  return invoiceTypeConfig[type]?.label ?? type ?? "—";
}

export function getTypeBadgeClass(type) {
  return invoiceTypeConfig[type]?.badgeClass ?? "";
}

export function getStatusLabel(status) {
  return invoiceStatusConfig[status]?.label ?? status ?? "—";
}

export function getStatusBadgeClass(status) {
  return invoiceStatusConfig[status]?.badgeClass ?? "";
}

export { TYPES, STATUSES };
