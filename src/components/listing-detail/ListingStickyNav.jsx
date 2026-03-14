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
      label: sectorConfig.offeringsLabel || "İçerikler",
    },
    {
      id: "reviews",
      icon: MessageCircle,
      label: "Değerlendirmeler",
      count: Number(listing.reviews) || 0,
    },
    {
      id: "photos",
      icon: ImageIcon,
      label: "Fotoğraflar",
      count: Array.isArray(listing.gallery) ? listing.gallery.length : 0,
    },
  ];

  return (
    <div className="sticky top-0 mt-10 md:mt-0 z-30 -mx-4 px-4 sm:mx-0 sm:px-0">
      <nav
        aria-label="Sayfa bölümleri"
        className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl rounded-2xl p-2 supports-[backdrop-filter]:bg-white/70"
      >
        <div className="relative">
          <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative inline-flex h-11 items-center gap-2.5 rounded-2xl px-4 md:px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.45)]"
                      : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  />

                  <span>{tab.label}</span>

                  {typeof tab.count === "number" && tab.count > 0 && (
                    <span
                      className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}

                  <span
                    className={`pointer-events-none absolute inset-x-4 -bottom-3 h-[2px] rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-slate-900 opacity-100"
                        : "bg-transparent opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
