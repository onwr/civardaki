import { defaultNavigation, BusinessTypes } from "@/lib/navigation-config";

function prismaBusinessTypeToNavType(type) {
  return type === "CORPORATE" ? BusinessTypes.CORPORATE : BusinessTypes.INDIVIDUAL;
}

/** Layout ile aynı menü satırı kimliği (`href` veya `menu-{index}`). */
export function navItemPrefId(item) {
  return item.href || `menu-${defaultNavigation.indexOf(item)}`;
}

/** Kart tıklaması için URL: üst öğede `href` yoksa ilk alt menü bağlantısı. */
export function resolveNavCardHref(item) {
  if (item.href) return item.href;
  const first = item.children?.find((c) => c && c.href);
  return first?.href || "/business/dashboard";
}

/**
 * Dashboard API’de kullanılacak üst menü kaynakları (gizli tercih yok; sunucu tarafı).
 */
export function getDashboardNavSourceItems(prismaBusinessType) {
  const bt = prismaBusinessTypeToNavType(prismaBusinessType);
  return defaultNavigation.filter((item) => {
    if (item.disabled) return false;
    if (item.allowedTypes && !item.allowedTypes.includes(bt)) return false;
    if (item.href === "/business/dashboard") return false;
    if (item.href === "/business/ekran-kilidi") return false;
    return true;
  });
}

function fmtInt(n) {
  return String(Math.round(Number(n) || 0));
}

/**
 * Tek satırlık modül kartı; `m` dashboard-summary içindeki tüm yardımcı alanları içerir.
 * @param {import("@/lib/navigation-config").defaultNavigation[number]} item
 * @param {Record<string, unknown>} m
 */
export function buildNavModuleRow(item, m) {
  const prefId = navItemPrefId(item);
  const href = resolveNavCardHref(item);
  const title = item.name;
  /** @type {{ label: string, value: string }[]} */
  let stats = [];

  const h = item.href;

  if (h === "/business/calendar") {
    stats = [{ label: "Önümüzdeki 7 gün etkinlik", value: fmtInt(m.calendarEventsWeekCount) }];
  } else if (h === "/business/civardaki-magaza") {
    stats = [
      { label: "Profil görüntüleme (30 gün)", value: fmtInt(m.views30Days) },
      { label: "Ürün tıklaması (30 gün)", value: fmtInt(m.productClicks30Days) },
    ];
  } else if (h === "/business/analytics") {
    stats = [
      { label: "Profil görüntüleme (30 gün)", value: fmtInt(m.views30Days) },
      { label: "Ürün tıklaması (30 gün)", value: fmtInt(m.productClicks30Days) },
      { label: "WhatsApp tıklaması (30 gün)", value: fmtInt(m.waClicks30Days) },
      { label: "Telefon tıklaması (30 gün)", value: fmtInt(m.phoneClicks30Days) },
    ];
  } else if (h === "/business/leads") {
    stats = [
      { label: "Talep (30 gün)", value: fmtInt(m.leadCount30Days) },
      { label: "Açık yeni talep", value: fmtInt(m.leadCountNew) },
    ];
  } else if (h === "/business/orders") {
    stats = [{ label: "Sipariş (30 gün)", value: fmtInt(m.orderCountMonth) }];
  } else if (h === "/business/notes") {
    stats = [{ label: "Aktif not", value: fmtInt(m.businessNoteCount) }];
  } else if (h === "/business/reviews") {
    stats = [{ label: "Bekleyen değerlendirme", value: fmtInt(m.reviewPendingCount) }];
  } else if (h === "/business/tickets") {
    stats = [{ label: "Açık destek talebi", value: fmtInt(m.supportTicketOpenCount) }];
  } else if (h === "/business/referrals") {
    stats = [{ label: "Ortaklık daveti", value: fmtInt(m.referralTotalCount) }];
  } else if (h === "/business/neighborhood") {
    stats = [{ label: "Mahalle gönderisi", value: fmtInt(m.neighborhoodPostCount) }];
  } else if (h === "/business/reservations") {
    stats = [
      { label: "Bekleyen rezervasyon", value: fmtInt(m.pendingReservationCount) },
      { label: "Onaylı yakın rezervasyon", value: fmtInt(m.reservationConfirmedUpcomingCount) },
    ];
  } else if (h === "/business/products") {
    stats = [
      { label: "Aktif ürün", value: fmtInt(m.productCount) },
      { label: "Kategori", value: fmtInt(m.categoryCount) },
    ];
  } else if (h === "/business/settings/profile") {
    stats = [
      { label: "Profil tamamlanma", value: `%${fmtInt(m.completionPercent)}` },
      { label: "Eksik adım", value: fmtInt(m.missingStepsCount) },
    ];
  } else {
    return null;
  }

  return { prefId, title, href, stats };
}

/**
 * @param {string} prismaBusinessType
 * @param {Record<string, unknown>} metricsBag
 */
export function buildNavModulesList(prismaBusinessType, metricsBag) {
  const items = getDashboardNavSourceItems(prismaBusinessType);
  return items
    .map((item) => buildNavModuleRow(item, metricsBag))
    .filter(Boolean);
}
