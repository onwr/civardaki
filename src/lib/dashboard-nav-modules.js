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

function fmtTry(n) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
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
  } else if (h === "/business/planning") {
    stats = [
      { label: "Devam eden plan", value: fmtInt(m.planningActiveProjectCount) },
      { label: "Açık görev", value: fmtInt(m.planningOpenTaskCount) },
    ];
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
  } else if (item.name === "Civardaki Araçları") {
    stats = [
      { label: "Talep (30 gün)", value: fmtInt(m.leadCount30Days) },
      { label: "Açık yeni talep", value: fmtInt(m.leadCountNew) },
      { label: "Sipariş (30 gün)", value: fmtInt(m.orderCountMonth) },
      { label: "Aktif not", value: fmtInt(m.businessNoteCount) },
      { label: "Bekleyen değerlendirme", value: fmtInt(m.reviewPendingCount) },
      { label: "Açık destek talebi", value: fmtInt(m.supportTicketOpenCount) },
      { label: "Ortaklık daveti", value: fmtInt(m.referralTotalCount) },
      { label: "Mahalle gönderisi", value: fmtInt(m.neighborhoodPostCount) },
      { label: "Bekleyen rezervasyon", value: fmtInt(m.pendingReservationCount) },
      { label: "Onaylı yakın rezervasyon", value: fmtInt(m.reservationConfirmedUpcomingCount) },
    ];
  } else if (h === "/business/employees") {
    stats = [
      { label: "Aktif çalışan", value: fmtInt(m.employeeCount) },
      { label: "Bekleyen izin talebi", value: fmtInt(m.pendingLeaveRequestCount) },
    ];
  } else if (h === "/business/customers") {
    stats = [{ label: "Kayıtlı müşteri", value: fmtInt(m.customerCount) }];
  } else if (h === "/business/suppliers") {
    stats = [{ label: "Kayıtlı tedarikçi", value: fmtInt(m.supplierCount) }];
  } else if (item.name === "Ürünler") {
    stats = [
      { label: "Aktif ürün", value: fmtInt(m.productCount) },
      { label: "Kategori", value: fmtInt(m.categoryCount) },
      { label: "Stok değeri", value: fmtTry(m.stockValue) },
    ];
  } else if (h === "/business/satislar") {
    stats = [
      { label: "Günlük satış", value: fmtTry(m.revenueToday) },
      { label: "Haftalık satış", value: fmtTry(m.revenueWeek) },
      { label: "Aylık satış (takvim)", value: fmtTry(m.revenueCalendarMonth) },
      { label: "Yıllık satış", value: fmtTry(m.revenueYear) },
    ];
  } else if (h === "/business/purchases") {
    stats = [
      { label: "Günlük alış", value: fmtTry(m.purchaseTotalToday) },
      { label: "Haftalık alış", value: fmtTry(m.purchaseTotalWeek) },
      { label: "Aylık alış", value: fmtTry(m.purchaseTotalCalendarMonth) },
      { label: "Yıllık alış", value: fmtTry(m.purchaseTotalYear) },
    ];
  } else if (h === "/business/quotes") {
    stats = [
      { label: "Taslak + gönderildi", value: fmtInt(m.quoteOpenCount) },
      { label: "Pipeline tutarı", value: fmtTry(m.quoteOpenSum) },
    ];
  } else if (item.name === "Nakit Yönetimi") {
    stats = [
      { label: "Hesap bakiyesi", value: fmtTry(m.assetsTotal) },
      { label: "Ay gideri", value: fmtTry(m.expenseCalendarMonth) },
      { label: "Yaklaşan masraf", value: fmtInt(m.upcomingExpenseCount) },
      { label: "Yaklaşan kredi", value: fmtInt(m.upcomingLoanCount) },
    ];
  } else if (h === "/business/settings/masterdata") {
    stats = [
      { label: "Profil tamamlanma", value: `%${fmtInt(m.completionPercent)}` },
      { label: "Eksik adım", value: fmtInt(m.missingStepsCount) },
    ];
  } else if (h === "/business/fihrist") {
    stats = [{ label: "Kayıt", value: fmtInt(m.fihristEntryCount) }];
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
