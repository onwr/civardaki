"use client";

import {
  Info,
  Utensils,
  ShoppingBag,
  Car,
  Scale,
  Briefcase,
  MessageCircle,
  Image as ImageIcon,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getSectorConfig } from "@/lib/listing/sector-config";

const ICON_MAP = {
  utensils: Utensils,
  shopping: ShoppingBag,
  car: Car,
  scale: Scale,
  briefcase: Briefcase,
};

export default function ListingStickyNav({ activeTab, onTabChange, listing }) {
  if (!listing) return null;

  const sectorConfig = getSectorConfig(listing.categorySlug || listing.sector);
  const OfferingsIcon = ICON_MAP[sectorConfig.offeringsTabIconKey] || Utensils;

  const tabs = [
    {
      id: "overview",
      icon: Info,
      label: "Genel Bakış",
    },
    {
      id: "offerings",
      icon: OfferingsIcon,
      label: sectorConfig.offeringsLabel || "Hizmetler",
    },
    {
      id: "offers",
      icon: Sparkles,
      label: "Fırsatlar",
      disabled: true,
    },
    {
      id: "photos",
      icon: ImageIcon,
      label: "Galeri",
      count: Array.isArray(listing.gallery) ? listing.gallery.length : 0,
    },
    {
      id: "reviews",
      icon: MessageCircle,
      label: "Yorumlar",
      count: Number(listing.reviews) || 0,
    },
    {
      id: "location",
      icon: MapPin,
      label: "Konum",
      disabled: true,
    },
  ];

  return (
    <div className="sticky top-24 z-30">
      <nav
        aria-label="İşletme detay bölümleri"
        className="overflow-hidden rounded-[26px] border border-slate-100 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
      >
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto px-4 py-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => {
                  if (tab.disabled) return;
                  onTabChange(tab.id);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`group relative inline-flex h-14 shrink-0 items-center gap-2.5 rounded-2xl px-5 text-sm font-black transition-all duration-300 ${
                  isActive
                    ? "bg-[#0057d9] text-white shadow-[0_14px_32px_rgba(0,87,217,0.24)]"
                    : tab.disabled
                      ? "text-slate-400 hover:bg-slate-50"
                      : "text-slate-600 hover:bg-blue-50 hover:text-[#0057d9]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : tab.disabled
                        ? "text-slate-300"
                        : "text-slate-400 group-hover:text-[#0057d9]"
                  }`}
                />

                <span>{tab.label}</span>

                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-[-12px] left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-[#0057d9]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}