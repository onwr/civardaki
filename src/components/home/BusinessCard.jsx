"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Zap, Flame } from "lucide-react";

export default function BusinessCard({ business }) {
  const desc = (business.description || "").slice(0, 120);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={business.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-300">
              LOGO
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-950 truncate">
              {business.name}
            </h3>
            {business.category && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest">
                {business.category}
              </span>
            )}
          </div>

          {/* SPRINT 9E: Signal Chips */}
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
            {/* 1. Rating */}
            {business.reviewCount > 0 ? (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Star className="h-3 w-3 fill-current" />
                {Number(business.rating).toFixed(1)}{" "}
                <span className="text-amber-600/60 ml-0.5">
                  ({business.reviewCount})
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
                <Star className="h-3 w-3" />
                Yeni
              </div>
            )}

            {/* 2. Response Time */}
            {business.avgResponseMinutes > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Zap className="h-3 w-3 fill-current" />
                {Math.round(business.avgResponseMinutes)} dk
              </div>
            )}

            {/* 3. Monthly Leads (Hot) */}
            {business.monthlyLeadCount > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <Flame className="h-3 w-3 fill-current" />
                Bu Ay {business.monthlyLeadCount} Talep
              </div>
            )}

            {/* 4. Location & Distance */}
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {business.distance !== null && business.distance !== undefined
                  ? `${
                      business.distance < 1
                        ? Math.round(business.distance * 1000) + " m"
                        : business.distance.toFixed(1) + " km"
                    } mesafede`
                  : (business.city || "—") +
                    (business.district ? ` / ${business.district}` : "")}
              </span>
            </div>
          </div>

          {desc && (
            <p className="mt-3 text-sm font-semibold text-slate-600 leading-relaxed">
              {desc}
              {business.description?.length > 120 ? "…" : ""}
            </p>
          )}

          <div className="mt-5">
            <Link
              href={`/business/${business.slug}`}
              className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-800 text-center hover:bg-slate-50"
            >
              İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
