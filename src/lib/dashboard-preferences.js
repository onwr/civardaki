// Dashboard (Anasayfa) kart tercihleri – sıra ve görünürlük

const STORAGE_KEY = "business-dashboard-preferences";

const DEFAULT_WIDGET_IDS = [
  "revenue",
  "expense",
  "employees",
  "products",
  "orders",
  "leads",
  "reviews",
  "views",
  "conversion",
];

export function getDefaultDashboardPreferences() {
  return {
    order: DEFAULT_WIDGET_IDS.map((id, index) => ({ id, index })),
    hidden: [],
  };
}

export function loadDashboardPreferences() {
  if (typeof window === "undefined") {
    return getDefaultDashboardPreferences();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaultPrefs = getDefaultDashboardPreferences();
      const currentOrder = parsed.order || [];
      const existingIds = new Set(currentOrder.map((o) => o.id));
      const newItems = defaultPrefs.order.filter((o) => !existingIds.has(o.id));
      const mergedOrder = [...currentOrder, ...newItems].map((item, index) => ({
        ...item,
        index,
      }));
      return {
        order: mergedOrder,
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden : defaultPrefs.hidden,
      };
    }
  } catch (e) {
    console.error("Dashboard preferences load error:", e);
  }
  return getDefaultDashboardPreferences();
}

export function saveDashboardPreferences(preferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setTimeout(() => {
      window.dispatchEvent(new Event("dashboardPreferencesChanged"));
    }, 0);
  } catch (e) {
    console.error("Dashboard preferences save error:", e);
  }
}

export function updateDashboardWidgetOrder(preferences, newOrder) {
  return {
    ...preferences,
    order: newOrder.map((item, index) => ({ ...item, index })),
  };
}

export function toggleDashboardWidgetVisibility(preferences, widgetId, isHidden) {
  const hidden = isHidden
    ? [...preferences.hidden, widgetId]
    : preferences.hidden.filter((id) => id !== widgetId);
  return { ...preferences, hidden };
}

export function resetDashboardPreferences() {
  const defaultPrefs = getDefaultDashboardPreferences();
  saveDashboardPreferences(defaultPrefs);
  return defaultPrefs;
}

export const DEFAULT_WIDGET_LABELS = {
  revenue: "Günlük Ciro",
  expense: "Günlük Masraf",
  employees: "Çalışan Sayısı",
  products: "Ürün / Stok",
  orders: "Sipariş (Bu Ay)",
  leads: "Müşteri Talepleri",
  reviews: "Değerlendirmeler",
  views: "Profil Görünümü",
  conversion: "Dönüşüm Oranı",
};

export { DEFAULT_WIDGET_IDS };
