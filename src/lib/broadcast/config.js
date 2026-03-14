/**
 * Duyuru (broadcast) layout, hedef kitle ve durum etiketleri
 */

export const BROADCAST_LAYOUTS = {
  BANNER: "Banner",
  MODAL: "Modal",
  SIDEBAR: "Sidebar",
  INLINE: "Inline",
};

export const BROADCAST_AUDIENCES = {
  ALL: "Tümü",
  USER: "Kullanıcı paneli",
  BUSINESS: "İşletme paneli",
};

export const BROADCAST_STATUSES = {
  DRAFT: "Taslak",
  ACTIVE: "Aktif",
  PAUSED: "Duraklatıldı",
  ENDED: "Sona erdi",
};

export const LAYOUT_OPTIONS = Object.entries(BROADCAST_LAYOUTS).map(([value, label]) => ({ value, label }));
export const AUDIENCE_OPTIONS = Object.entries(BROADCAST_AUDIENCES).map(([value, label]) => ({ value, label }));
export const STATUS_OPTIONS = Object.entries(BROADCAST_STATUSES).map(([value, label]) => ({ value, label }));

export function getLayoutLabel(layout) {
  return BROADCAST_LAYOUTS[layout] ?? layout ?? "—";
}

export function getAudienceLabel(audience) {
  return BROADCAST_AUDIENCES[audience] ?? audience ?? "—";
}

export function getStatusLabel(status) {
  return BROADCAST_STATUSES[status] ?? status ?? "—";
}
