/**
 * Sipariş durum etiketleri ve kart konfigürasyonu.
 */

export const STATUS_LABELS = {
  PENDING: "Bekleyen",
  CONFIRMED: "Onaylı",
  PREPARING: "Hazırlanıyor",
  ON_THE_WAY: "Yolda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

export const STATUS_FILTER_OPTIONS = [
  { id: "all", label: "TÜMÜ" },
  { id: "PENDING", label: "BEKLEYEN" },
  { id: "CONFIRMED", label: "ONAYLI" },
  { id: "PREPARING", label: "HAZIRLANIYOR" },
  { id: "ON_THE_WAY", label: "YOLDA" },
  { id: "DELIVERED", label: "TESLİM" },
  { id: "CANCELLED", label: "İPTAL" },
];

export const STATUS_CARD_CONFIG = {
  PENDING: { text: "Bekliyor", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  CONFIRMED: { text: "Onaylandı", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  PREPARING: { text: "Hazırlanıyor", color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  ON_THE_WAY: { text: "Yolda", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  DELIVERED: { text: "Teslim Edildi", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED: { text: "İptal", color: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "—";
}

export function getStatusCardConfig(status) {
  return STATUS_CARD_CONFIG[status] || STATUS_CARD_CONFIG.PENDING;
}
