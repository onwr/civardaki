"use client";

import {
  Sparkles,
  ChevronRight,
  BadgeCheck,
  Clock3,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { getSectorConfig } from "@/lib/listing/sector-config";

export default function ListingOverviewSection({
  listing,
  sectorConfig,
  onTabChange,
  onSelectProduct,
}) {
  if (!listing) return null;

  const config =
    sectorConfig || getSectorConfig(listing.categorySlug || listing.sector);

  const defaultBadges = [
    { label: "Kaliteli Hizmet", icon: BadgeCheck },
    { label: "Hızlı Servis", icon: Zap },
    { label: "Uygun Fiyat", icon: Wallet },
    { label: "Aktif İşletme", icon: Clock3 },
  ];

  const badges =
    listing.atmosphere && listing.atmosphere.length > 0
      ? listing.atmosphere.slice(0, 4).map((label, i) => ({
          label,
          icon: defaultBadges[i % defaultBadges.length].icon,
        }))
      : defaultBadges;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7"
    >
      <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-5 w-5 text-[#0057d9]" />
          </div>

          <h2 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
            İşletme Hakkında
          </h2>
        </div>

        <p className="max-w-3xl text-[15px] leading-8 text-slate-600">
          {listing.description || "Bu işletme henüz açıklama eklemedi."}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-[#0057d9]" />
                </div>

                <span className="text-sm font-bold text-slate-700">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {listing.highlights && listing.highlights.length > 0 && (
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
                {config.highlightsSectionTitle || "Öne Çıkan Hizmetler"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                İşletmenin en çok ilgi gören hizmetleri.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onTabChange("offerings")}
              className="hidden items-center gap-1 text-sm font-black text-[#0057d9] sm:flex"
            >
              Tümünü Gör
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listing.highlights.slice(0, 4).map((item, i) => {
              const allItems = listing.products?.flatMap((c) => c.items) ?? [];
              const fullItem = allItems.find(
                (p) =>
                  String(p.id) === String(item.id) ||
                  p.name === (item.title || item.name)
              );

              return (
                <motion.button
                  key={item.id ?? i}
                  type="button"
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    if (fullItem) {
                      onSelectProduct(fullItem);
                    } else {
                      onSelectProduct({
                        id: item.id,
                        name: item.title || item.name,
                        description: item.desc || "",
                        price:
                          parseFloat(String(item.price).replace(/[^\d.]/g, "")) ||
                          0,
                        image: item.image,
                        options: [],
                        extras: [],
                      });
                    }
                  }}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:shadow-xl"
                >
                  <div className="h-32 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="line-clamp-1 font-black text-slate-950">
                      {item.title || item.name}
                    </h4>

                    {item.price && (
                      <p className="mt-1 text-sm font-bold text-[#0057d9]">
                        {item.price}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {listing.features && listing.features.length > 0 && (
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
          <h2 className="mb-6 text-2xl font-black tracking-[-0.02em] text-slate-950">
            Özellikler & İmkanlar
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listing.features.map((feature, i) => {
              const Icon = feature.icon || BadgeCheck;

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <Icon className="h-5 w-5 text-[#0057d9]" />
                  <span className="font-bold text-slate-700">
                    {feature.label || feature.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}