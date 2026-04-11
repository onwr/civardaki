// Kullanıcı paneli navigasyon yapısı

import {
  HomeIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  CalculatorIcon,
  MapPinIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

export const userNavigation = [
  { name: "Ana Sayfa", href: "/user", icon: HomeIcon, exact: true },
  { name: "Mahalle Panosu", href: "/user/neighborhood", icon: MapPinIcon },
  { name: "İşletmeler", href: "/user/isletmeler", icon: BuildingStorefrontIcon },
  { name: "Hesap Kitap", href: "/user/finance", icon: CalculatorIcon },
  { name: "Sepetim", href: "/user/cart", icon: ShoppingCartIcon },
  { name: "Siparişlerim", href: "/user/orders", icon: ClipboardDocumentListIcon },
  { name: "Randevu - Rezervasyon", href: "/user/appointments", icon: CalendarDaysIcon },
  { name: "Taleplerim", href: "/user/requests", icon: WrenchScrewdriverIcon },
  { name: "Destek Taleplerim", href: "/user/tickets", icon: LifebuoyIcon },
  { name: "Profilim", href: "/user/profile", icon: UserCircleIcon },
];

