// Navigation — Bizim Hesap menü yapısına birebir (Civardaki uyarlaması)
import {
  Home,
  ShoppingCart,
  Calculator,
  Users,
  Factory,
  Tags,
  Truck,
  FolderOpen,
  TurkishLira,
  ShoppingBasket,
  Cog,
  BarChart3,
  CircleHelp,
  Book,
  Lock,
  Store,
  Wrench,
  UserRoundCheck,
  Calendar,
  ClipboardList,
} from "lucide-react";

export const BusinessTypes = {
  INDIVIDUAL: "individual",
  CORPORATE: "corporate",
};

const productChildren = [
  {
    name: "Ürün - Hizmet Ekle",
    href: "/business/products",
    activePathMatch: "exact",
  },
  { name: "Depolar", href: "/business/products/warehouses", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Üretim", href: "/business/products/production", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Özel Fiyat Listeleri", href: "/business/products/price-lists", badge: { text: "yeni", variant: "new" } },
  { name: "Kataloglarınız", href: "/business/products/catalogs" },
  { name: "Ürün Varyantları", href: "/business/products/variants" },
  { name: "Ürün Kategorileri", href: "/business/products/categories" },
];

const cashChildren = [
  { name: "Hesaplarım", href: "/business/cash/accounts" },
  { name: "Masraflar", href: "/business/cash/expenses" },
  { name: "Gelen E-Faturalar", href: "/business/cash/e-invoices" },
  { name: "Krediler", href: "/business/cash/loans", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Demirbaşlar", href: "/business/cash/assets", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Projeler", href: "/business/cash/projects" },
  { name: "Çek Portföyü", href: "/business/cash/checks", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Senet Portföyü", href: "/business/cash/promissory-notes", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
];

const ecommerceChildren = [
  { name: "Satışlar", href: "/business/ecommerce/sales" },
  { name: "Mutabakat", href: "/business/ecommerce/reconciliation", badge: { text: "yeni", variant: "new" } },
  { name: "İstatistikler", href: "/business/ecommerce/statistics" },
  { name: "Ayarlar", href: "/business/ecommerce/settings" },
  { name: "Müşteri Soruları", href: "/business/ecommerce/questions" },
  { name: "Ürün Eşleştirme", href: "/business/ecommerce/product-matching" },
  { name: "Listeleme", href: "/business/ecommerce/listing" },
  { name: "Fiyat Güncelleme", href: "/business/ecommerce/price-update" },
];

const settingsChildren = [
  { name: "Vitrin / İşletme Profili", href: "/business/settings/profile", badge: { text: "yeni", variant: "new" } },
  { name: "Tanımlar", href: "/business/settings/masterdata" },
  { name: "e-Fatura POS Ayarları", href: "/business/settings/pos-settings", badge: { text: "yeni", variant: "new" } },
  { name: "Teklif ve Özel Şablonlar", href: "/business/settings/proposal-templates" },
  { name: "Etiket Şablonları", href: "/business/settings/label-templates" },
  { name: "SMS Ayarları", href: "/business/settings/sms-settings" },
  { name: "Kargo Entegrasyonu", href: "/business/settings/cargo-setting", badge: { text: "yeni", variant: "new" } },
];

const reportsChildren = [
  {
    name: "Satışlar - Alışlar",
    href: "/business/reports/sales-purchases",
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  { name: "Finansal Raporlar", href: "/business/reports/financial" },
  {
    name: "Stok Raporları",
    href: "/business/reports/inventory",
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  { name: "Müşteri Listesi", href: "/business/reports/customers" },
];

const civardakiExtrasChildren = [
  { name: "Hizmet Talepleri", href: "/business/leads" },
  { name: "Siparişler", href: "/business/orders" },
  { name: "Notlar", href: "/business/notes", allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE] },
  { name: "Değerlendirmeler", href: "/business/reviews" },
  { name: "Destek Taleplerim", href: "/business/tickets" },
  { name: "Ortaklık ve gelir", href: "/business/referrals" },
  { name: "Mahalle Panosu", href: "/business/neighborhood" },
  { name: "Randevu - Rezervasyon", href: "/business/reservations" },
];

export const defaultNavigation = [
  {
    name: "Ana Sayfa",
    href: "/business/dashboard",
    icon: Home,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Takvim",
    href: "/business/calendar",
    icon: Calendar,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "İş Planlama",
    href: "/business/planning",
    icon: ClipboardList,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Civardaki Mağaza",
    href: "/business/civardaki-magaza",
    icon: Store,
    badge: { text: "yeni", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Analitik",
    href: "/business/analytics",
    icon: BarChart3,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Civardaki Araçları",
    icon: Wrench,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: civardakiExtrasChildren,
  },
  {
    name: "Çalışanlar",
    href: "/business/employees",
    icon: UserRoundCheck,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Müşteriler",
    href: "/business/customers",
    icon: Users,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Tedarikçiler",
    href: "/business/suppliers",
    icon: Factory,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Ürünler",
    icon: Tags,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: productChildren,
  },
  {
    name: "Satışlar",
    href: "/business/satislar",
    icon: ShoppingCart,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Alışlar",
    href: "/business/purchases",
    icon: Truck,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Teklifler",
    href: "/business/quotes",
    icon: FolderOpen,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Nakit Yönetimi",
    icon: TurkishLira,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: cashChildren,
  },
  {
    name: "E-Ticaret",
    href: "/business/ecommerce/settings",
    icon: ShoppingBasket,
    /** Geçici: modül tamamlanınca kaldır */
    disabled: true,
    disabledReason: "E-Ticaret bölümü henüz kullanıma açılmadı.",
    badge: { text: "yakında", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: ecommerceChildren,
  },
  {
    name: "Ayarlar",
    href: "/business/settings/masterdata",
    icon: Cog,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: settingsChildren,
  },
  {
    name: "Raporlar",
    href: "/business/reports",
    icon: BarChart3,
    /** Geçici: modül tamamlanınca kaldır */
    disabled: true,
    disabledReason: "Raporlar bölümü henüz kullanıma açılmadı.",
    badge: { text: "yakında", variant: "new" },
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
    children: reportsChildren,
  },
  {
    name: "Fihrist",
    href: "/business/fihrist",
    icon: Book,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
  {
    name: "Ekran kilidi",
    href: "/business/ekran-kilidi",
    icon: Lock,
    allowedTypes: [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE],
  },
];
