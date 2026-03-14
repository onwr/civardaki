"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ChevronRight, ShieldCheck, Zap } from "lucide-react";

export function BusinessCard({ business }) {
  const priceLevelLabels = {
    ekonomik: "EKONOMİK",
    orta: "ORTA SEGMENT",
    luks: "PREMIUM",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group relative"
    >
      <Link href={`/isletme/${business.slug || ""}`}>
        {/* Banner Area */}
        <div className="relative h-48 sm:h-52 overflow-hidden">
          <Image
            src={business.banner || business.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"}
            alt={business.name || "İşletme"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm
              ${business.isOpen ? "bg-emerald-500/90 text-white" : "bg-slate-700/90 text-white"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-white ${business.isOpen ? "animate-pulse" : ""}`} />
              {business.isOpen ? "Açık" : "Kapalı"}
            </span>
          </div>

          {Number(business.rating != null ? business.rating : 0) >= 4.5 && (
            <div className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-[#004aad]" />
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-white/95 text-slate-800 backdrop-blur-sm">
              {business.subcategory || business.category || "—"}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-[#004aad] transition-colors leading-tight">
                {business.name}
              </h3>
              {business.distance !== null && business.distance !== undefined ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2 italic">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {business.distance < 1
                    ? Math.round(business.distance * 1000) + " m"
                    : business.distance.toFixed(1) + " km"} mesafede
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {business.city || business.district ? `${business.city || ""}${business.city && business.district ? " / " : ""}${business.district || ""}` : "Konum belirtilmemiş"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
              <Star className="h-4 w-4 fill-amber-500" />
              <span className="text-sm font-semibold">{Number(business.rating != null ? business.rating : 0).toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            {(Number(business.reviewCount) || 0) > 0 && (
              <span className="text-xs text-slate-500">({Number(business.reviewCount) || 0} yorum)</span>
            )}
            {(Number(business.avgResponseMinutes) || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Zap className="h-3.5 w-3.5" />
                ~{Math.round(Number(business.avgResponseMinutes))} dk yanıt
              </span>
            )}
          </div>

          <div className="w-full py-3 rounded-xl bg-slate-50 group-hover:bg-[#004aad] flex items-center justify-center gap-2 transition-colors">
            <span className="text-sm font-medium text-slate-600 group-hover:text-white">İncele</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
