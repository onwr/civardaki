"use client";

import { ChevronRight, Utensils, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { getSectorConfig } from "@/lib/listing/sector-config";

export default function ListingOfferingsSection({
  listing,
  sectorConfig,
  onSelectProduct,
}) {
  if (!listing) return null;
  const config = sectorConfig || getSectorConfig(listing.categorySlug || listing.sector);
  const products = listing.products || [];
  const iconKey = config.offeringsTabIconKey || "utensils";
  const EmptyIcon = iconKey === "shopping" ? Briefcase : Utensils;

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center"
      >
        <EmptyIcon className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {config.emptyOfferingsTitle}
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          {config.emptyOfferingsSubtitle}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {products.map((category, idx) => (
        <section
          key={idx}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-slate-400 rounded-full" />
            {category.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {category.items.map((item, i) => (
              <motion.button
                key={item.id ?? i}
                type="button"
                whileHover={{ y: -1 }}
                onClick={() => onSelectProduct(item)}
                className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all text-left group"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    <span className="font-semibold text-slate-700 shrink-0">
                      {typeof item.price === "number"
                        ? item.hasVariants
                          ? `${item.price}₺'den başlayan`
                          : `${item.price}₺`
                        : item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                    Detay & Sepete ekle{" "}
                    <ChevronRight className="w-3.5 h-3.5" />
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
