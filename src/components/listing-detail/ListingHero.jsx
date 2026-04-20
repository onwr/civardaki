"use client";

import Link from "next/link";
import {
  Star,
  MapPin,
  Share2,
  Heart,
  CheckCircle,
  ChevronRight,
  Phone,
  Globe,
  Calendar,
} from "lucide-react";

export default function ListingHero({
  listing,
  onReservationClick,
  onTrack,
  sectorConfig,
}) {
  if (!listing) return null;
  const terms = sectorConfig || { action: "Rezervasyon Yap" };

  return (
    <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
      <img
        src={listing.coverImage}
        alt={listing.title}
        className="w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"
        aria-hidden
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 md:bottom-10 left-0 right-0 p-4 sm:p-6 lg:p-8 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-700/80 text-slate-200 text-xs font-semibold uppercase tracking-wide">
                  {listing.type}
                </span>
                {listing.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Doğrulanmış
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${listing.isOpen
                      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-100"
                      : "bg-red-500/20 border-red-400/30 text-red-100"
                    }`}
                >
                  {listing.isOpen ? "Şu an açık" : "Kapalı"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-sm">
                {listing.title}
              </h1>

              {/* Breadcrumb */}
              <div className="flex mb-4 items-center gap-2 text-sm text-slate-300">
                <Link
                  href="/"
                  className="hover:text-white transition-colors font-medium"
                >
                  Anasayfa
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                <Link
                  href="/search"
                  className="hover:text-white transition-colors font-medium"
                >
                  İstanbul
                </Link>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="text-white font-medium truncate max-w-[180px] sm:max-w-[280px]">
                  {listing.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= Math.round(listing.rating)
                            ? "fill-current"
                            : "text-slate-500"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-white">
                    {listing.rating}
                  </span>
                  <span className="text-slate-400">
                    ({listing.reviews} yorum)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Ort. tutar:</span>
                  <span className="font-semibold text-white">
                    {listing.priceRange}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  onClick={() => onTrack?.("CLICK_PHONE")}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Ara
                </a>
              )}
              {listing.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("CLICK_CTA_PRIMARY")}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <MapPin className="w-4 h-4" /> Yol tarifi
                </a>
              )}
              {listing.website && (
                <a
                  href={`https://${listing.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("CLICK_WEBSITE")}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Globe className="w-4 h-4" /> Web
                </a>
              )}
              <button
                type="button"
                onClick={() => onTrack?.("CLICK_SHARE_PROFILE")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Paylaş
              </button>
              <button
                type="button"
                onClick={() => onTrack?.("FAVORITE_ADD")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Heart className="w-4 h-4" /> Kaydet
              </button>
              <button
                type="button"
                onClick={onReservationClick}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <Calendar className="w-4 h-4" /> {terms.action}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
