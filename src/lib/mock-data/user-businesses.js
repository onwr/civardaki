// Mock data for user businesses (firmalar)

// Mock GPS koordinatları (İstanbul Kadıköy)
export const mockUserLocation = {
  lat: 40.9883,
  lng: 29.0265,
  address: "Kadıköy, İstanbul",
};

// Kategoriler
export const categories = [
  {
    id: "yemek-icecek",
    name: "Yemek İçecek",
    icon: "🍽️",
    subcategories: ["Restoran", "Kafe", "Dönerci", "Pastane"],
  },
  {
    id: "alisveris",
    name: "Alışveriş",
    icon: "🛒",
    subcategories: ["Market", "Bakkal", "Manav", "Kasap"],
  },
  {
    id: "hizmet",
    name: "Hizmet",
    icon: "🔧",
    subcategories: ["Temizlik", "Tadilat", "Tamir", "Nakliye"],
  },
  {
    id: "ulasim",
    name: "Ulaşım",
    icon: "🚗",
    subcategories: ["Taksi", "Çekici", "Kargo", "Kurye"],
  },
  {
    id: "danismanlik",
    name: "Danışmanlık",
    icon: "💼",
    subcategories: ["Avukat", "Muhasebeci", "Doktor", "Psikolog"],
  },
  {
    id: "guzellik-saglik",
    name: "Güzellik Sağlık",
    icon: "💅",
    subcategories: ["Kuaför", "Masaj", "Fitness", "Spa"],
  },
  {
    id: "egitim",
    name: "Eğitim",
    icon: "📚",
    subcategories: ["Dersane", "Özel Ders", "Kurs", "Eğitmen"],
  },
  {
    id: "ilan",
    name: "İlan",
    icon: "📢",
    subcategories: ["Araç", "Emlak", "Eşya", "Elektronik"],
  },
  {
    id: "diger",
    name: "Diğer",
    icon: "🔑",
    subcategories: ["Çilingir", "Elektrikçi", "Veteriner"],
  },
];

// Mock firmalar
export const mockBusinesses = [
  {
    id: "1",
    slug: "lezzet-donercisi",
    name: "Lezzet Dönercisi",
    category: "yemek-icecek",
    subcategory: "Dönerci",
    type: "product", // product, service, info, ad
    logo: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=1200&h=400&fit=crop",
    address: "Bağdat Caddesi No:123, Kadıköy, İstanbul",
    lat: 40.9883,
    lng: 29.0265,
    distance: 0.5, // km
    rating: 4.7,
    reviewCount: 89,
    isOpen: true,
    workingHours: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
      wednesday: { open: "09:00", close: "22:00" },
      thursday: { open: "09:00", close: "22:00" },
      friday: { open: "09:00", close: "23:00" },
      saturday: { open: "09:00", close: "23:00" },
      sunday: { open: "10:00", close: "22:00" },
    },
    phone: "+90 555 123 4567",
    email: "info@lezzetdoner.com",
    website: "https://lezzetdoner.com",
    instagram: "@lezzetdoner",
    facebook: "https://facebook.com/lezzetdoner",
    youtube: "https://youtube.com/@lezzetdoner",
    description: "1995 yılından beri hizmet veren, taze ve kaliteli ürünlerle müşterilerimize hizmet sunan dönerci.",
    priceLevel: "orta", // ekonomik, orta, luks
    viewCount: 1250,
    salesStats: {
      totalOrders: 450,
      totalRevenue: 125000,
      averageRating: 4.7,
    },
    images: [
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
    ],
    products: [
      {
        id: "p1",
        name: "Tavuk Döner Dürüm",
        price: 45.0,
        description: "Taze tavuk döner, özel baharatlarla",
        image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop",
        stock: 25,
        variants: [
          { id: "v1", name: "Boy", type: "size", options: ["Küçük", "Orta", "Büyük"], prices: [35, 45, 55] },
        ],
      },
      {
        id: "p2",
        name: "Köfte Menü",
        price: 65.0,
        description: "Izgara köfte, pilav, salata ve ayran",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop",
        stock: 18,
        variants: [],
      },
    ],
    reviews: [
      {
        id: "r1",
        userName: "Ahmet Y.",
        rating: 5,
        comment: "Çok lezzetli, kesinlikle tavsiye ederim!",
        date: new Date("2024-10-15"),
      },
      {
        id: "r2",
        userName: "Mehmet K.",
        rating: 4,
        comment: "Güzel ama biraz pahalı",
        date: new Date("2024-10-10"),
      },
    ],
  },
  {
    id: "2",
    slug: "kadikoy-market",
    name: "Kadıköy Market",
    category: "alisveris",
    subcategory: "Market",
    type: "product",
    logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop",
    address: "Moda Caddesi No:45, Kadıköy, İstanbul",
    lat: 40.9900,
    lng: 29.0300,
    distance: 1.2,
    rating: 4.5,
    reviewCount: 67,
    isOpen: true,
    workingHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:00" },
      sunday: { open: "09:00", close: "22:00" },
    },
    phone: "+90 555 234 5678",
    email: "info@kadikoymarket.com",
    website: "https://kadikoymarket.com",
    instagram: "@kadikoymarket",
    facebook: "https://facebook.com/kadikoymarket",
    description: "Taze sebze meyve ve günlük ihtiyaçlarınız için",
    priceLevel: "ekonomik",
    viewCount: 890,
    salesStats: {
      totalOrders: 320,
      totalRevenue: 89000,
      averageRating: 4.5,
    },
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
    ],
    products: [
      {
        id: "p3",
        name: "Taze Domates",
        price: 15.0,
        description: "Kg başına",
        image: "https://images.unsplash.com/photo-1546094097-3c0b0c0b0b0b?w=400&h=400&fit=crop",
        stock: 100,
        variants: [
          { id: "v2", name: "Miktar", type: "quantity", options: ["500g", "1kg", "2kg"], prices: [7.5, 15, 28] },
        ],
      },
    ],
    reviews: [
      {
        id: "r3",
        userName: "Ayşe D.",
        rating: 5,
        comment: "Taze ürünler, uygun fiyat",
        date: new Date("2024-10-18"),
      },
    ],
  },
  {
    id: "3",
    slug: "dr-mehmet-yilmaz",
    name: "Dr. Mehmet Yılmaz",
    category: "danismanlik",
    subcategory: "Doktor",
    type: "service",
    logo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=400&fit=crop",
    address: "Acıbadem Mahallesi, Doktorlar Caddesi No:12, Kadıköy, İstanbul",
    lat: 40.9850,
    lng: 29.0200,
    distance: 2.5,
    rating: 4.9,
    reviewCount: 156,
    isOpen: true,
    workingHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "10:00", close: "14:00" },
      sunday: null,
    },
    phone: "+90 555 345 6789",
    email: "dr.mehmet@example.com",
    website: "https://drmehmetyilmaz.com",
    instagram: "@drmehmetyilmaz",
    description: "Aile hekimi, genel muayene ve sağlık danışmanlığı",
    priceLevel: "orta",
    viewCount: 2100,
    salesStats: {
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 4.9,
    },
    services: [
      {
        id: "s1",
        name: "Genel Muayene",
        price: 300,
        duration: 30,
        description: "Genel sağlık kontrolü ve muayene",
        type: "consultation",
      },
      {
        id: "s2",
        name: "Aşı",
        price: 150,
        duration: 15,
        description: "Aşı uygulaması",
        type: "consultation",
      },
    ],
    reviews: [
      {
        id: "r4",
        userName: "Fatma Ö.",
        rating: 5,
        comment: "Çok ilgili ve profesyonel bir doktor",
        date: new Date("2024-10-20"),
      },
    ],
  },
  {
    id: "4",
    slug: "hizli-tamir-servisi",
    name: "Hızlı Tamir Servisi",
    category: "hizmet",
    subcategory: "Tamir",
    type: "service",
    logo: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&h=400&fit=crop",
    address: "Fenerbahçe Mahallesi, Tamirci Sokak No:5, Kadıköy, İstanbul",
    lat: 40.9920,
    lng: 29.0280,
    distance: 3.8,
    rating: 4.6,
    reviewCount: 45,
    isOpen: true,
    workingHours: {
      monday: { open: "08:00", close: "20:00" },
      tuesday: { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday: { open: "08:00", close: "20:00" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "10:00", close: "16:00" },
    },
    phone: "+90 555 456 7890",
    email: "info@hizlitamir.com",
    website: "https://hizlitamir.com",
    description: "7/24 acil tamir hizmeti, ev ve ofis tamiri",
    priceLevel: "orta",
    viewCount: 650,
    salesStats: {
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 4.6,
    },
    services: [
      {
        id: "s3",
        name: "Elektrikçi Hizmeti",
        price: 200,
        duration: 60,
        description: "Elektrik arızası tamiri",
        type: "technical",
      },
      {
        id: "s4",
        name: "Tesisatçı Hizmeti",
        price: 250,
        duration: 90,
        description: "Su tesisatı tamiri",
        type: "technical",
      },
      {
        id: "s5",
        name: "Acil Çilingir",
        price: 300,
        duration: 30,
        description: "7/24 acil çilingir hizmeti",
        type: "emergency",
      },
    ],
    reviews: [
      {
        id: "r5",
        userName: "Ali Ç.",
        rating: 5,
        comment: "Çok hızlı geldiler, sorunumu çözdüler",
        date: new Date("2024-10-19"),
      },
    ],
  },
  {
    id: "5",
    slug: "guzellik-salonu",
    name: "Güzellik Salonu",
    category: "guzellik-saglik",
    subcategory: "Kuaför",
    type: "info",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop",
    address: "Bahariye Caddesi No:78, Kadıköy, İstanbul",
    lat: 40.9870,
    lng: 29.0250,
    distance: 0.8,
    rating: 4.8,
    reviewCount: 203,
    isOpen: true,
    workingHours: {
      monday: { open: "09:00", close: "19:00" },
      tuesday: { open: "09:00", close: "19:00" },
      wednesday: { open: "09:00", close: "19:00" },
      thursday: { open: "09:00", close: "19:00" },
      friday: { open: "09:00", close: "20:00" },
      saturday: { open: "09:00", close: "20:00" },
      sunday: { open: "10:00", close: "18:00" },
    },
    phone: "+90 555 567 8901",
    email: "info@guzelliksalonu.com",
    website: "https://guzelliksalonu.com",
    instagram: "@guzelliksalonu",
    facebook: "https://facebook.com/guzelliksalonu",
    description: "Saç kesimi, boyama, makyaj ve güzellik hizmetleri",
    priceLevel: "luks",
    viewCount: 1800,
    salesStats: {
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 4.8,
    },
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    ],
    reviews: [
      {
        id: "r6",
        userName: "Zeynep K.",
        rating: 5,
        comment: "Harika bir salon, çok memnun kaldım",
        date: new Date("2024-10-17"),
      },
    ],
  },
  {
    id: "6",
    slug: "2018-model-araba",
    name: "2018 Model Araba",
    category: "ilan",
    subcategory: "Araç",
    type: "ad",
    logo: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=400&fit=crop",
    address: "Kadıköy, İstanbul",
    lat: 40.9900,
    lng: 29.0270,
    distance: 1.5,
    rating: 0,
    reviewCount: 0,
    isOpen: true,
    phone: "+90 555 678 9012",
    email: "araba@example.com",
    description: "2018 model, düşük km, bakımlı araba satılık",
    priceLevel: "orta",
    viewCount: 320,
    adDetails: {
      title: "2018 Model Araba Satılık",
      price: 250000,
      description: "2018 model, 45000 km, düzenli bakımlı, kaza geçmemiş",
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
      ],
      features: ["Otomatik vites", "Klima", "ABS", "Yol bilgisayarı"],
    },
  },
];

// Filtreleme fonksiyonları
export function filterBusinessesByCategory(businesses, categoryId) {
  if (!categoryId) return businesses;
  return businesses.filter((b) => b.category === categoryId);
}

export function filterBusinessesByDistance(businesses, maxDistance) {
  if (!maxDistance) return businesses;
  return businesses.filter((b) => b.distance <= maxDistance);
}

export function filterBusinessesByStatus(businesses, status) {
  if (status === "all") return businesses;
  if (status === "open") return businesses.filter((b) => b.isOpen);
  return businesses;
}

export function filterBusinessesByPrice(businesses, priceLevel) {
  if (!priceLevel || priceLevel === "all") return businesses;
  return businesses.filter((b) => b.priceLevel === priceLevel);
}

export function filterBusinessesByRating(businesses, minRating) {
  if (!minRating) return businesses;
  return businesses.filter((b) => b.rating >= minRating);
}

export function sortBusinessesByDistance(businesses) {
  return [...businesses].sort((a, b) => a.distance - b.distance);
}

