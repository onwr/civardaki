/**
 * Destek talebi (ticket) durum, öncelik ve kategori etiketleri
 */

export const TICKET_STATUSES = {
  OPEN: "Açık",
  IN_PROGRESS: "İşlemde",
  WAITING_REPLY: "Yanıt Bekliyor",
  RESOLVED: "Çözüldü",
  CLOSED: "Kapatıldı",
};

export const TICKET_PRIORITIES = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  URGENT: "Acil",
};

export const TICKET_CATEGORIES = {
  GENERAL: "Genel",
  BILLING: "Faturalama / Ödeme",
  TECHNICAL: "Teknik",
  ACCOUNT: "Hesap",
  OTHER: "Diğer",
};

export const TICKET_CREATOR_TYPES = {
  USER: "Kullanıcı",
  BUSINESS: "İşletme",
};

export const STATUS_OPTIONS = Object.entries(TICKET_STATUSES).map(([value, label]) => ({ value, label }));
export const PRIORITY_OPTIONS = Object.entries(TICKET_PRIORITIES).map(([value, label]) => ({ value, label }));
export const CATEGORY_OPTIONS = Object.entries(TICKET_CATEGORIES).map(([value, label]) => ({ value, label }));
export const CREATOR_TYPE_OPTIONS = Object.entries(TICKET_CREATOR_TYPES).map(([value, label]) => ({ value, label }));

export function getStatusLabel(status) {
  return TICKET_STATUSES[status] ?? status ?? "—";
}

export function getPriorityLabel(priority) {
  return TICKET_PRIORITIES[priority] ?? priority ?? "—";
}

export function getCategoryLabel(category) {
  return TICKET_CATEGORIES[category] ?? category ?? "—";
}

export function getCreatorTypeLabel(creatorType) {
  return TICKET_CREATOR_TYPES[creatorType] ?? creatorType ?? "—";
}
