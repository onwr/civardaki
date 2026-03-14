"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { getSectorConfig } from "@/lib/listing/sector-config";

export default function ListingOverviewSection({
  listing,
  sectorConfig,
  onTabChange,
  onSelectProduct,
}) {
  if (!listing) return null;
  const config = sectorConfig || getSectorConfig(listing.categorySlug || listing.sector);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          İşletme Hakkında
        </h2>
        <p className="text-slate-600 leading-relaxed">
          {listing.description || "Bu işletme henüz açıklama eklemedi."}
        </p>
        {listing.atmosphere && listing.atmosphere.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" /> Atmosfer & Ortam
            </h4>
            <div className="flex flex-wrap gap-2">
              {listing.atmosphere.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {listing.features && listing.features.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Özellikler & İmkanlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listing.features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors"
                >
                  {Icon && (
                    <Icon className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-700">
                    {feature.label || feature.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {listing.faqs && listing.faqs.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {listing.faqs.map((faq, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100"
              >
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {faq.q}
                </h4>
                <p className="text-slate-600 text-sm pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {listing.highlights && listing.highlights.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {config.highlightsSectionTitle}
            </h2>
            <button
              type="button"
              onClick={() => onTabChange("offerings")}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              Tümünü gör <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listing.highlights.map((item, i) => {
              const allItems =
                listing.products?.flatMap((c) => c.items) ?? [];
              const fullItem = allItems.find(
                (p) =>
                  String(p.id) === String(item.id) ||
                  p.name === (item.title || item.name),
              );
              return (
                <motion.button
                  key={item.id ?? i}
                  type="button"
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    if (fullItem) {
                      onSelectProduct(fullItem);
                    } else {
                      onSelectProduct({
                        id: item.id,
                        name: item.title || item.name,
                        description: item.desc || "",
                        price:
                          parseFloat(
                            String(item.price).replace(/[^\d.]/g, ""),
                          ) || 0,
                        image: item.image,
                        options: [],
                        extras: [],
                      });
                    }
                  }}
                  className="text-left bg-slate-50 rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all overflow-hidden group"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-slate-200">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-slate-900 leading-tight line-clamp-2">
                      {item.title || item.name}
                    </h4>
                    <span className="text-slate-600 text-sm font-semibold shrink-0">
                      {item.price}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
