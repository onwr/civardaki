"use client";

import Link from "next/link";
import {
  Star,
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Phone,
  Globe,
  Calendar,
  Navigation,
  MessageCircle,
} from "lucide-react";

export default function ListingHero({
  listing,
  onReservationClick,
  onTrack,
  sectorConfig,
}) {
  if (!listing) return null;

  const terms = sectorConfig || { action: "Rezervasyon Yap" };
  const rating = Number(listing.rating) || 0;
  const reviewCount = Number(listing.reviews) || 0;

  return (
    <section className="relative min-h-[610px] overflow-hidden bg-slate-950 pt-[116px]">
      <div className="absolute inset-0">
        <img
          src={listing.coverImage || "/images/business-cover-placeholder.jpg"}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[494px] max-w-[1480px] items-end px-4 pb-16 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl">
              {listing.type || "İşletme"}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-black backdrop-blur-xl ${
                listing.isOpen
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-rose-400/20 text-rose-100"
              }`}
            >
              {listing.isOpen ? "Şu an açık" : "Kapalı"}
            </span>

            {/* Doğrulama altyapısı hazır, sistemi sonra bağlarız */}
            {listing.isVerified && (
              <span className="rounded-full bg-blue-500 px-4 py-2 text-xs font-black text-white">
                Doğrulanmış
              </span>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[42px] font-black leading-[1.05] tracking-[-0.045em] text-white sm:text-[64px]">
                {listing.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-200">
                <Link href="/" className="hover:text-white">
                  Anasayfa
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <Link href="/search" className="hover:text-white">
                  İşletmeler
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-white">{listing.title}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i <= Math.round(rating)
                            ? "fill-current"
                            : "text-white/25"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-black text-white">
                    {rating > 0 ? rating.toFixed(1) : "Yeni"}
                  </span>

                  <span className="text-slate-300">
                    ({reviewCount} değerlendirme)
                  </span>
                </div>

                {listing.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-300" />
                    <span>{listing.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  onClick={() => onTrack?.("CLICK_PHONE")}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-[#0057d9] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.28)] transition hover:bg-[#004cc2]"
                >
                  <Phone className="h-5 w-5" />
                  Ara
                </a>
              )}

              {listing.phone && (
                <a
                  href={`https://wa.me/${String(listing.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("CLICK_WHATSAPP")}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                >
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  WhatsApp
                </a>
              )}

              {listing.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("CLICK_CTA_PRIMARY")}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                >
                  <Navigation className="h-5 w-5 text-[#0057d9]" />
                  Yol Tarifi
                </a>
              )}

              <button
                type="button"
                onClick={() => onTrack?.("CLICK_SHARE_PROFILE")}
                className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
                Paylaş
              </button>

              <button
                type="button"
                onClick={() => onTrack?.("FAVORITE_ADD")}
                className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                <Heart className="h-5 w-5" />
                Kaydet
              </button>

              <button
                type="button"
                onClick={onReservationClick}
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white shadow-xl transition hover:bg-slate-900"
              >
                <Calendar className="h-5 w-5" />
                {terms.action}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}