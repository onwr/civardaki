// Navigation — Civardaki işletme paneli (platform odaklı, düz menü)
import {
  Home,
  Tags,
  Cog,
  BarChart3,
  Lock,
  Store,
  Calendar,
  Inbox,
  ShoppingBag,
  StickyNote,
  Star,
  LifeBuoy,
  Users,
  MapPin,
  CalendarCheck,
} from "lucide-react";

export const BusinessTypes = {
  INDIVIDUAL: "individual",
  CORPORATE: "corporate",
};

const navTypes = [BusinessTypes.INDIVIDUAL, BusinessTypes.CORPORATE];

const settingsChildren = [
  {
    name: "Vitrin / İşletme Profili",
    href: "/business/settings/profile",
    badge: { text: "yeni", variant: "new" },
  },
  { name: "Menü özelleştirme", href: "/business/settings/menu-customization" },
  { name: "Abonelik ve ödeme", href: "/business/billing" },
];

export const defaultNavigation = [
  {
    name: "Ana Sayfa",
    href: "/business/dashboard",
    icon: Home,
    allowedTypes: navTypes,
  },
  {
    name: "Takvim",
    href: "/business/calendar",
    icon: Calendar,
    allowedTypes: navTypes,
  },
  {
    name: "Civardaki Mağaza",
    href: "/business/civardaki-magaza",
    icon: Store,
    badge: { text: "yeni", variant: "new" },
    allowedTypes: navTypes,
  },
  {
    name: "Analitik",
    href: "/business/analytics",
    icon: BarChart3,
    allowedTypes: navTypes,
  },
  {
    name: "Hizmet Talepleri",
    href: "/business/leads",
    icon: Inbox,
    allowedTypes: navTypes,
  },
  {
    name: "Siparişler",
    href: "/business/orders",
    icon: ShoppingBag,
    allowedTypes: navTypes,
  },
  {
    name: "Notlar",
    href: "/business/notes",
    icon: StickyNote,
    allowedTypes: navTypes,
  },
  {
    name: "Değerlendirmeler",
    href: "/business/reviews",
    icon: Star,
    allowedTypes: navTypes,
  },
  {
    name: "Destek Taleplerim",
    href: "/business/tickets",
    icon: LifeBuoy,
    allowedTypes: navTypes,
  },
  {
    name: "Ortaklık ve gelir",
    href: "/business/referrals",
    icon: Users,
    allowedTypes: navTypes,
  },
  {
    name: "Mahalle Panosu",
    href: "/business/neighborhood",
    icon: MapPin,
    allowedTypes: navTypes,
  },
  {
    name: "Randevu - Rezervasyon",
    href: "/business/reservations",
    icon: CalendarCheck,
    allowedTypes: navTypes,
  },
  {
    name: "Ürün ve Hizmetler",
    href: "/business/products",
    icon: Tags,
    allowedTypes: navTypes,
  },
  {
    name: "Ayarlar",
    href: "/business/settings/profile",
    icon: Cog,
    allowedTypes: navTypes,
    children: settingsChildren,
  },
  {
    name: "Ekran kilidi",
    href: "/business/ekran-kilidi",
    icon: Lock,
    allowedTypes: navTypes,
  },
];
