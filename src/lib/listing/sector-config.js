/**
 * Listing sayfası için bölüm etiketleri ve aksiyon metinleri.
 * Kategori slug veya adına göre config döner; kaynak olarak /api/public/categories
 * ve işletmenin primaryCategory bilgisi kullanılır.
 */

const DEFAULT_CONFIG = {
  action: "Rezervasyon Yap",
  step1Title: "Kaç kişi olacaksınız?",
  unit: "Kişi",
  timeGroup1: "ÖĞLE",
  timeGroup2: "AKŞAM",
  successTitle: "Rezervasyon Talebiniz",
  typeTag: "Rezervasyon",
  showGuests: true,
  offeringsLabel: "Menü",
  offeringsTabIconKey: "utensils",
  emptyOfferingsTitle: "Liste Hazırlanıyor",
  emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
  highlightsSectionTitle: "Menüden Öne Çıkanlar",
};

/** Kategori slug veya adına göre özel config. Slug'lar /api/public/categories ile uyumludur. */
const CATEGORY_CONFIG_MAP = {
  // Yemek / restoran
  restoran: { ...DEFAULT_CONFIG },
  yemek: { ...DEFAULT_CONFIG },
  kafe: { ...DEFAULT_CONFIG },
  restoranlar: { ...DEFAULT_CONFIG },
  "yemek-restoran": { ...DEFAULT_CONFIG },

  // Perakende
  market: {
    ...DEFAULT_CONFIG,
    offeringsLabel: "Ürünler",
    offeringsTabIconKey: "shopping",
    highlightsSectionTitle: "Öne Çıkan Ürünler",
  },
  supermarket: {
    ...DEFAULT_CONFIG,
    offeringsLabel: "Ürünler",
    offeringsTabIconKey: "shopping",
    highlightsSectionTitle: "Öne Çıkan Ürünler",
  },
  perakende: {
    ...DEFAULT_CONFIG,
    offeringsLabel: "Ürünler",
    offeringsTabIconKey: "shopping",
    highlightsSectionTitle: "Öne Çıkan Ürünler",
  },

  // Otomotiv
  otomotiv: {
    action: "Randevu Al",
    step1Title: "",
    unit: "Araç",
    timeGroup1: "SABAH",
    timeGroup2: "ÖĞLEDEN SONRA",
    successTitle: "Randevu Talebiniz",
    typeTag: "Servis Randevusu",
    showGuests: false,
    offeringsLabel: "Hizmet & Ürün",
    offeringsTabIconKey: "car",
    emptyOfferingsTitle: "Liste Hazırlanıyor",
    emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
    highlightsSectionTitle: "Öne Çıkan Hizmetler",
  },
  "oto-servis": {
    action: "Randevu Al",
    step1Title: "",
    unit: "Araç",
    timeGroup1: "SABAH",
    timeGroup2: "ÖĞLEDEN SONRA",
    successTitle: "Randevu Talebiniz",
    typeTag: "Servis Randevusu",
    showGuests: false,
    offeringsLabel: "Hizmet & Ürün",
    offeringsTabIconKey: "car",
    emptyOfferingsTitle: "Liste Hazırlanıyor",
    emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
    highlightsSectionTitle: "Öne Çıkan Hizmetler",
  },

  // Hukuk / danışmanlık
  hukuk: {
    action: "Randevu Al",
    step1Title: "",
    unit: "Kişi",
    timeGroup1: "SABAH",
    timeGroup2: "ÖĞLEDEN SONRA",
    successTitle: "Randevu Talebiniz",
    typeTag: "Danışmanlık",
    showGuests: false,
    offeringsLabel: "Uzmanlıklar",
    offeringsTabIconKey: "scale",
    emptyOfferingsTitle: "Liste Hazırlanıyor",
    emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
    highlightsSectionTitle: "Öne Çıkan Hizmetler",
  },
  avukat: {
    action: "Randevu Al",
    step1Title: "",
    unit: "Kişi",
    timeGroup1: "SABAH",
    timeGroup2: "ÖĞLEDEN SONRA",
    successTitle: "Randevu Talebiniz",
    typeTag: "Danışmanlık",
    showGuests: false,
    offeringsLabel: "Uzmanlıklar",
    offeringsTabIconKey: "scale",
    emptyOfferingsTitle: "Liste Hazırlanıyor",
    emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
    highlightsSectionTitle: "Öne Çıkan Hizmetler",
  },
  danismanlik: {
    action: "Randevu Al",
    step1Title: "",
    unit: "Kişi",
    timeGroup1: "SABAH",
    timeGroup2: "ÖĞLEDEN SONRA",
    successTitle: "Randevu Talebiniz",
    typeTag: "Danışmanlık",
    showGuests: false,
    offeringsLabel: "Uzmanlıklar",
    offeringsTabIconKey: "scale",
    emptyOfferingsTitle: "Liste Hazırlanıyor",
    emptyOfferingsSubtitle: "Bu işletme henüz detaylı listesini yüklemedi.",
    highlightsSectionTitle: "Öne Çıkan Hizmetler",
  },
};

function normalizeKey(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/-/g, "-");
}

/**
 * Kategori slug veya adına göre listing config döner.
 * Slug öncelikli; slug yoksa name ile NAME_KEYS / CATEGORY_CONFIG_MAP uyumuna bakılır.
 * @param {string} categorySlugOrName - listing.categorySlug veya listing.type (kategori adı) veya eski listing.sector
 * @returns {object} offeringsLabel, action, typeTag, showGuests, vb.
 */
export function getSectorConfig(categorySlugOrName) {
  const key = normalizeKey(categorySlugOrName);
  if (!key) return DEFAULT_CONFIG;

  if (CATEGORY_CONFIG_MAP[key]) return CATEGORY_CONFIG_MAP[key];

  const slugLike = key.replace(/\s+/g, "-");
  if (CATEGORY_CONFIG_MAP[slugLike]) return CATEGORY_CONFIG_MAP[slugLike];

  if (key.includes("restoran") || key.includes("yemek") || key.includes("kafe"))
    return DEFAULT_CONFIG;
  if (key.includes("market") || key.includes("süpermarket") || key.includes("perakende"))
    return CATEGORY_CONFIG_MAP.market;
  if (key.includes("oto") || key.includes("otomotiv"))
    return CATEGORY_CONFIG_MAP.otomotiv;
  if (key.includes("hukuk") || key.includes("avukat") || key.includes("danışman"))
    return CATEGORY_CONFIG_MAP.hukuk;

  return DEFAULT_CONFIG;
}
