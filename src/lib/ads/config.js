/**
 * Reklam (ad) yerleşim ve durum etiketleri
 */

export const AD_PLACEMENTS = {
  BANNER: "Banner",
  SIDEBAR: "Sidebar",
  LISTING_TOP: "Liste üstü",
  LISTING_INLINE: "Liste içi",
  FOOTER: "Footer",
  POPUP: "Popup",
};

export const AD_STATUSES = {
  DRAFT: "Taslak",
  ACTIVE: "Aktif",
  PAUSED: "Duraklatıldı",
  ENDED: "Sona erdi",
};

export const PLACEMENT_OPTIONS = Object.entries(AD_PLACEMENTS).map(([value, label]) => ({ value, label }));
export const STATUS_OPTIONS = Object.entries(AD_STATUSES).map(([value, label]) => ({ value, label }));

export function getPlacementLabel(placement) {
  return AD_PLACEMENTS[placement] ?? placement ?? "—";
}

export function getStatusLabel(status) {
  return AD_STATUSES[status] ?? status ?? "—";
}
