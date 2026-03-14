import { format } from "date-fns";
import { tr } from "date-fns/locale";

const DAYS_TR = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];
const DEFAULT_HOURS = DAYS_TR.map((day) => ({ day, time: "09:00 - 18:00" }));

export function parseWorkingHours(str) {
  if (!str || typeof str !== "string") return DEFAULT_HOURS;
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (typeof parsed === "object" && parsed !== null) {
      return DAYS_TR.map((day) => ({
        day,
        time: parsed[day] || "09:00 - 18:00",
      }));
    }
  } catch (_) {}
  return DEFAULT_HOURS;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80";

function buildProductItem(p) {
  const basePrice = p.price ?? p.discountPrice ?? 0;
  const variants = (p.productvariant || [])
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price ?? 0,
      discountPrice: v.discountPrice ?? null,
      stock: v.stock,
    }));
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    basePrice,
    price: basePrice,
    hasVariants: variants.length > 0,
    variants,
    image: p.imageUrl || DEFAULT_IMAGE,
    calories: null,
    prepTime: null,
    allergens: [],
    options: [],
    extras: [],
  };
}

export function buildListingFromApi(business, catalog, reviews) {
  if (!business) return null;
  const location =
    [business.address, business.city, business.district]
      .filter(Boolean)
      .join(", ") ||
    [business.city, business.district].filter(Boolean).join(", ") ||
    "—";
  const hours = parseWorkingHours(business.workingHours);
  const categories = catalog?.categories || [];
  const uncategorized = catalog?.uncategorized || [];
  const allProducts = [
    ...categories.flatMap((c) =>
      (c.products || []).map((p) => ({ ...p, categoryName: c.name })),
    ),
    ...uncategorized.map((p) => ({ ...p, categoryName: null })),
  ];
  const productCategories = [];
  const seenCategories = new Set();
  categories.forEach((c) => {
    if (!c.products?.length) return;
    const catName = c.name || "Diğer";
    if (!seenCategories.has(catName)) {
      seenCategories.add(catName);
      productCategories.push({
        category: catName,
        items: c.products.map((p) => buildProductItem(p)),
      });
    }
  });
  if (uncategorized.length) {
    productCategories.push({
      category: "Diğer",
      items: uncategorized.map((p) => buildProductItem(p)),
    });
  }
  const highlights = allProducts.slice(0, 6).map((p, i) => ({
    id: p.id || i,
    title: p.name,
    desc: (p.description || "").slice(0, 60),
    price: `${p.price ?? p.discountPrice ?? 0}₺`,
    image: p.imageUrl || DEFAULT_IMAGE,
  }));
  const reviewsList = (reviews || []).map((r) => ({
    user: r.reviewerName || "Anonim",
    rating: r.rating || 0,
    date: r.createdAt
      ? format(new Date(r.createdAt), "d MMM yyyy", { locale: tr })
      : "",
    text: r.content || "",
  }));
  return {
    id: business.id,
    title: business.name,
    description: business.description || "",
    rating: Number(business.rating) || 0,
    reviews: business.reviewCount || 0,
    location,
    phone: business.phone || "",
    website: business.website || "",
    ratingBreakdown: {
      service: business.rating,
      flavor: business.rating,
      ambience: business.rating,
    },
    reviewsList,
    coverImage:
      business.coverUrl ||
      business.logoUrl ||
      DEFAULT_COVER,
    gallery: business.gallery?.length
      ? business.gallery
      : business.coverUrl
        ? [business.coverUrl]
        : [],
    sector: business.primaryCategory?.slug || "food",
    categorySlug: business.primaryCategory?.slug || null,
    categoryName: business.primaryCategory?.name || business.category || "İşletme",
    type: business.primaryCategory?.name || business.category || "İşletme",
    priceRange: "₺",
    isVerified: Boolean(business.isVerified),
    isOpen: business.isOpen !== false,
    reservationEnabled: business.reservationEnabled !== false,
    reservationConfig: business.reservationConfig || null,
    atmosphere: [],
    faqs: [],
    hours,
    features: [],
    coordinates:
      business.latitude != null && business.longitude != null
        ? { lat: business.latitude, lng: business.longitude }
        : null,
    popularTimes: [],
    highlights,
    products: productCategories,
  };
}
