// Navigation yapısı - Layout ve Menü Özelleştirme sayfasında kullanılır
import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingBag,
  ShoppingCart,
  Truck,
  FileText,
  DollarSign,
  Settings,
  Calendar,
  Clock,
  UserCheck,
  Briefcase,
  ClipboardList,
  Package,
  HelpCircle,
  BarChart3,
  MessageSquare,
  Star,
  PieChart,
  Share2,
  MapPin,
  CreditCard
} from "lucide-react";

// İşletme Tipleri
export const BusinessTypes = {
  INDIVIDUAL: "individual", // Bireysel/Profesyonel (Avukat, Taksi, Berber)
  CORPORATE: "corporate",   // Kurumsal/Ticari (Restoran, Market, Mağaza)
};

export const defaultNavigation = [
  {
    name: "Ana Sayfa",
    href: "/business/dashboard",
    icon: LayoutDashboard,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Müşteriler",
    href: "/business/customers",
    icon: Users,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Analitik",
    href: "/business/analytics",
    icon: PieChart,
    badge: { text: "YENİ", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Firma Bilgileri (Kiralama)",
    href: "/business/billing",
    icon: CreditCard,
    badge: { text: "YENİ", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Hizmet Talepleri",
    href: "/business/leads",
    icon: MessageSquare,
    badge: { text: "2 yeni", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Referans Sistemi",
    href: "/business/referrals",
    icon: Share2,
    badge: { text: "YENİ", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Mahalle Panosu",
    href: "/user/neighborhood",
    icon: MapPin,
    badge: { text: "Sosyal", variant: "info" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Değerlendirmeler",
    href: "/business/reviews",
    icon: Star,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Destek Taleplerim",
    href: "/business/tickets",
    icon: HelpCircle,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Tedarikçiler",
    href: "/business/suppliers",
    icon: Building2,
    allowedTypes: [BusinessTypes.CORPORATE] // Sadece Kurumsal
  },
  {
    name: "Menü / Ürünler",
    href: "/business/products",
    icon: Package,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: [
      { name: "Katalog", href: "/business/products" },
      { name: "Tanımlar", href: "/business/products/definitions" },
      { name: "Varyasyonlar", href: "/business/products/variants" },
      { name: "Kataloglar", href: "/business/products/catalogs" },
      { name: "Fiyat Listeleri", href: "/business/products/price-lists" },
      { name: "Üretim", href: "/business/products/production" },
      { name: "Depolar", href: "/business/products/warehouses" },
    ],
  },
  {
    name: "Satışlar",
    href: "/business/orders",
    icon: ShoppingCart,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Alışlar",
    href: "/business/purchases",
    icon: Truck,
    allowedTypes: [BusinessTypes.CORPORATE] // Sadece Kurumsal
  },
  {
    name: "Teklifler",
    href: "/business/quotes",
    icon: FileText,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Finans Yönetimi",
    href: "/business/cash",
    icon: DollarSign,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: [
      { name: "Hesaplarım", href: "/business/cash/accounts" },
      { name: "Masraflar", href: "/business/cash/expenses" },
      { name: "Gelen E-Faturalar", href: "/business/cash/e-invoices" },
      { name: "Krediler", href: "/business/cash/loans", allowedTypes: [BusinessTypes.CORPORATE] },
      { name: "Demirbaşlar", href: "/business/cash/assets", allowedTypes: [BusinessTypes.CORPORATE] },
      { name: "Projeler", href: "/business/cash/projects" },
      { name: "Çek Portföyü", href: "/business/cash/checks", allowedTypes: [BusinessTypes.CORPORATE] },
      { name: "Senet Portföyü", href: "/business/cash/promissory-notes", allowedTypes: [BusinessTypes.CORPORATE] },
    ],
  },
  {
    name: "E-Ticaret",
    href: "/business/ecommerce",
    icon: ShoppingBag,
    badge: { text: "yeni", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: [
      { name: "Satışlar", href: "/business/ecommerce/sales" },
      {
        name: "Mutabakat",
        href: "/business/ecommerce/reconciliation",
        badge: { text: "yeni", variant: "new" },
      },
      { name: "İstatistikler", href: "/business/ecommerce/statistics" },
      { name: "Ürün Eşleştirme", href: "/business/ecommerce/product-matching" },
      { name: "Listeleme", href: "/business/ecommerce/listing" },
      { name: "Fiyat Güncelleme", href: "/business/ecommerce/price-update" },
    ],
  },
  {
    name: "Ayarlar",
    href: "/business/settings",
    icon: Settings,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: [
      {
        name: "Menü Özelleştirme",
        href: "/business/settings/menu-customization",
      },
    ],
  },
  {
    name: "Takvim",
    href: "/business/calendar",
    icon: Calendar,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Randevular",
    href: "/business/reservations",
    icon: Clock,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Çalışanlar",
    href: "/business/employees",
    icon: UserCheck,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "İnsan Kaynakları",
    href: "/business/hr",
    icon: Briefcase,
    allowedTypes: [BusinessTypes.CORPORATE], // Sadece Kurumsal
    children: [
      { name: "Maaş Bordroları", href: "/business/hr/payroll" },
      { name: "İzin Yönetimi", href: "/business/hr/leaves" },
      {
        name: "Performans Değerlendirmeleri",
        href: "/business/hr/performance",
      },
      { name: "Eğitim Kayıtları", href: "/business/hr/training" },
    ],
  },
  {
    name: "İş Planlama",
    href: "/business/planning",
    icon: ClipboardList,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Demirbaşlar",
    href: "/business/assets",
    icon: Package,
    allowedTypes: [BusinessTypes.CORPORATE]
  },
  {
    name: "Notlar",
    href: "/business/notes",
    icon: FileText,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Destek",
    href: "/business/help",
    icon: HelpCircle,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE]
  },
  {
    name: "Raporlar",
    href: "/business/reports",
    icon: BarChart3,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: [
      {
        name: "Satışlar - Alışlar",
        href: "/business/reports/sales-purchases",
        allowedTypes: [BusinessTypes.CORPORATE]
      },
      { name: "Finansal Raporlar", href: "/business/reports/financial" },
      { name: "Stok Raporları", href: "/business/reports/inventory", allowedTypes: [BusinessTypes.CORPORATE] },
      { name: "Müşteri Listesi", href: "/business/reports/customers" },
    ],
  },
];
