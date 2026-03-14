/**
 * Dashboard için ortak helper'lar. Null/undefined güvenli, production-ready.
 * TypeScript yok; JS.
 */

const FALLBACK_TEXT = "—";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80";

/**
 * Metin fallback: null/undefined/boş string ise fallback döner.
 * @param {string|null|undefined} value
 * @param {string} [fallback]
 * @returns {string}
 */
export function textFallback(value, fallback = FALLBACK_TEXT) {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s === "" ? fallback : s;
}

/**
 * Para formatı (TR). Geçersiz sayıda fallback.
 * @param {number|null|undefined} value
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatCurrency(value, fallback = "0₺") {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return `${n.toLocaleString("tr-TR")}₺`;
}

/**
 * Tarih (sadece gün). Geçersizde fallback.
 * @param {string|Date|null|undefined} dateVal
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatDate(dateVal, fallback = FALLBACK_TEXT) {
  if (dateVal == null) return fallback;
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("tr-TR");
  } catch {
    return fallback;
  }
}

/**
 * Tarih + saat (kısa). Geçersizde fallback.
 * @param {string|Date|null|undefined} dateVal
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatDateTime(dateVal, fallback = FALLBACK_TEXT) {
  if (dateVal == null) return fallback;
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

/**
 * BusinessCard bileşeni için API/dashboard verisini normalize eder.
 * Eksik alanlar güvenli varsayılanlarla doldurulur.
 * @param {object} raw
 * @returns {object}
 */
export function normalizeBusinessForCard(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      id: "unknown",
      slug: "",
      name: "İşletme",
      banner: DEFAULT_IMAGE,
      logo: DEFAULT_IMAGE,
      city: "",
      district: "",
      category: "",
      subcategory: "",
      rating: 0,
      reviewCount: 0,
      isOpen: false,
      distance: null,
      avgResponseMinutes: 0,
      monthlyLeadCount: 0,
    };
  }
  const id = raw.id != null ? String(raw.id) : "unknown";
  const slug = textFallback(raw.slug, "");
  const name = textFallback(raw.name, "İşletme");
  const logo = raw.logo || raw.logoUrl || DEFAULT_IMAGE;
  const banner = raw.banner || raw.coverUrl || logo;
  const rating = raw.rating != null ? Number(raw.rating) : 0;
  const reviewCount = Math.max(0, parseInt(raw.reviewCount, 10) || 0);
  return {
    id,
    slug,
    name,
    banner,
    logo,
    city: raw.city != null ? String(raw.city) : "",
    district: raw.district != null ? String(raw.district) : "",
    category: raw.category != null ? String(raw.category) : "",
    subcategory: raw.subcategory != null ? String(raw.subcategory) : raw.category != null ? String(raw.category) : "",
    rating: Number.isNaN(rating) ? 0 : rating,
    reviewCount,
    isOpen: raw.isOpen !== false,
    distance: raw.distance != null && raw.distance !== "" ? Number(raw.distance) : null,
    avgResponseMinutes: Math.max(0, parseFloat(raw.avgResponseMinutes, 10) || 0),
    monthlyLeadCount: Math.max(0, parseInt(raw.monthlyLeadCount, 10) || 0),
  };
}

/**
 * Dashboard API yanıtını normalize eder. Eksik bloklar null/boş dizi ile güvenli.
 * @param {object} data
 * @returns {object}
 */
export function normalizeDashboardResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      user: { displayName: "Kullanıcı", firstName: "Kullanıcı" },
      location: null,
      stats: null,
      activeOrder: null,
      upcomingAppointment: null,
      quickActions: [],
      popularBusinesses: [],
      recentlyViewedBusinesses: [],
      recentActivities: [],
    };
  }

  const user = data.user && typeof data.user === "object"
    ? {
        displayName: textFallback(data.user.displayName, "Kullanıcı"),
        firstName: textFallback(data.user.firstName, "Kullanıcı"),
      }
    : { displayName: "Kullanıcı", firstName: "Kullanıcı" };

  const location = data.location && typeof data.location === "object"
    ? {
        city: data.location.city != null ? String(data.location.city) : "",
        district: data.location.district != null ? String(data.location.district) : "",
        address: data.location.address != null ? String(data.location.address) : "",
      }
    : null;

  const stats = data.stats && typeof data.stats === "object"
    ? {
        loyaltyPoints: Math.max(0, parseInt(data.stats.loyaltyPoints, 10) || 0),
        totalOrders: Math.max(0, parseInt(data.stats.totalOrders, 10) || 0),
        spendingLimit: Math.max(0, parseFloat(data.stats.spendingLimit, 10) || 0),
        activeCoupons: Math.max(0, parseInt(data.stats.activeCoupons, 10) || 0),
      }
    : null;

  const activeOrder = data.activeOrder && typeof data.activeOrder === "object" && data.activeOrder.id
    ? {
        id: String(data.activeOrder.id),
        orderNumber: textFallback(data.activeOrder.orderNumber, ""),
        businessName: textFallback(data.activeOrder.businessName, "İşletme"),
        businessSlug: textFallback(data.activeOrder.businessSlug, ""),
        businessLogo: data.activeOrder.businessLogo || null,
        courierName: data.activeOrder.courierName || null,
        etaMinutes: data.activeOrder.etaMinutes != null ? Number(data.activeOrder.etaMinutes) : null,
        total: data.activeOrder.total != null ? Number(data.activeOrder.total) : 0,
        status: textFallback(data.activeOrder.status, "pending"),
      }
    : null;

  const upcomingAppointment = data.upcomingAppointment && typeof data.upcomingAppointment === "object" && data.upcomingAppointment.id
    ? {
        id: String(data.upcomingAppointment.id),
        title: textFallback(data.upcomingAppointment.title, ""),
        businessName: textFallback(data.upcomingAppointment.businessName, ""),
        providerName: textFallback(data.upcomingAppointment.providerName, data.upcomingAppointment.businessName || ""),
        businessSlug: data.upcomingAppointment.businessSlug ? String(data.upcomingAppointment.businessSlug) : null,
        image: data.upcomingAppointment.image || null,
        dateTime: data.upcomingAppointment.dateTime || null,
        status: textFallback(data.upcomingAppointment.status, ""),
      }
    : null;

  const quickActions = Array.isArray(data.quickActions) && data.quickActions.length > 0
    ? data.quickActions.map((a, i) => ({
        label: textFallback(a.label, "İşlem"),
        sub: textFallback(a.sub, ""),
        icon: a.icon || "repeat",
        href: a.href && String(a.href).trim() ? String(a.href).trim() : "/user",
      }))
    : [];

  const popularBusinesses = Array.isArray(data.popularBusinesses)
    ? data.popularBusinesses.map(normalizeBusinessForCard).filter((b) => b.slug)
    : [];

  const recentlyViewedBusinesses = Array.isArray(data.recentlyViewedBusinesses)
    ? data.recentlyViewedBusinesses.map(normalizeBusinessForCard).filter((b) => b.slug)
    : [];

  const recentActivities = Array.isArray(data.recentActivities)
    ? data.recentActivities.map((a) => ({
        id: a.id != null ? String(a.id) : `act-${Math.random().toString(36).slice(2, 9)}`,
        type: a.type || "order",
        title: textFallback(a.title, "Aktivite"),
        date: a.date != null ? a.date : null,
        icon: a.icon != null ? String(a.icon) : "🛒",
      }))
    : [];

  return {
    user,
    location,
    stats,
    activeOrder,
    upcomingAppointment,
    quickActions,
    popularBusinesses,
    recentlyViewedBusinesses,
    recentActivities,
  };
}

export { DEFAULT_IMAGE, FALLBACK_TEXT };
