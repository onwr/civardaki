"use client";

import {
  ChevronRight,
  Utensils,
  Briefcase,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { getSectorConfig } from "@/lib/listing/sector-config";

export default function ListingOfferingsSection({
  listing,
  sectorConfig,
  onSelectProduct,
}) {
  if (!listing) return null;

  const config =
    sectorConfig || getSectorConfig(listing.categorySlug || listing.sector);

  const products = listing.products || [];
  const iconKey = config.offeringsTabIconKey || "utensils";
  const EmptyIcon = iconKey === "shopping" ? ShoppingBag : Utensils;

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-slate-100 bg-white p-12 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
          <EmptyIcon className="h-10 w-10 text-[#0057d9]" />
        </div>

        <h3 className="text-2xl font-black text-slate-950">
          {config.emptyOfferingsTitle || "Henüz hizmet eklenmedi"}
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
          {config.emptyOfferingsSubtitle ||
            "Bu işletme henüz hizmet veya ürün listesi eklemedi."}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7"
    >
      {products.map((category, idx) => (
        <section
          key={idx}
          className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Sparkles className="h-6 w-6 text-[#0057d9]" />
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
                  {category.category}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {category.items?.length || 0} seçenek
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(category.items || []).map((item, i) => (
              <motion.button
                key={item.id ?? i}
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => onSelectProduct(item)}
                className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={item.image || "/images/product-placeholder.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="line-clamp-2 font-black leading-snug text-slate-950 transition group-hover:text-[#0057d9]">
                      {item.name}
                    </h4>

                    <span className="shrink-0 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-black text-[#0057d9]">
                      {typeof item.price === "number"
                        ? item.hasVariants
                          ? `${item.price}₺+`
                          : `${item.price}₺`
                        : item.price || "Fiyat sor"}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  )}

                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-black text-slate-500 transition group-hover:text-[#0057d9]">
                    Detayları Gör
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}