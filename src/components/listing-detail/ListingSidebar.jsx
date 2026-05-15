"use client";

import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Calendar,
  Navigation,
  Star,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

export default function ListingSidebar({
  listing,
  sectorConfig,
  showAllHours,
  onToggleHours,
  onReservationClick,
  onTrack,
}) {
  if (!listing) return null;

  const terms = sectorConfig || { action: "Rezervasyon Yap" };
  const hoursList = Array.isArray(listing.hours) ? listing.hours : [];
  const todayIndex = new Date().getDay();
  const currentDayName = DAYS[todayIndex];

  const todayHours =
    hoursList.find((h) => h.day === currentDayName) ||
    hoursList[0] || {
      day: currentDayName,
      time: "—",
    };

  const mapUrl = listing.coordinates
    ? `https://www.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}`
    : null;

  const rating = Number(listing.rating) || 0;
  const reviews = Number(listing.reviews) || 0;

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-44 space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack?.("CLICK_CTA_PRIMARY")}
              className="group relative block h-52 overflow-hidden bg-slate-100"
            >
              <iframe
                title="İşletme konumu"
                src={`https://www.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}&z=15&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/15" />

              <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 opacity-0 shadow-xl transition group-hover:opacity-100">
                <Navigation className="h-4 w-4 text-[#0057d9]" />
                Haritada Aç
              </span>
            </a>
          )}

          <div className="p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
              <MapPin className="h-5 w-5 text-[#0057d9]" />
              İletişim & Konum
            </h3>

            <div className="space-y-4">
              {listing.location && (
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MapPin className="h-5 w-5 text-[#0057d9]" />
                  </div>

                  <p className="pt-1 text-sm font-semibold leading-6 text-slate-600">
                    {listing.location}
                  </p>
                </div>
              )}

              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  onClick={() => onTrack?.("CLICK_PHONE")}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Phone className="h-5 w-5 text-[#0057d9]" />
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {listing.phone}
                  </span>
                </a>
              )}

              {listing.website && (
                <a
                  href={
                    listing.website.startsWith("http")
                      ? listing.website
                      : `https://${listing.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("CLICK_WEBSITE")}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Globe className="h-5 w-5 text-[#0057d9]" />
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    Web sitesini ziyaret et
                  </span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onReservationClick}
              disabled={listing.reservationEnabled === false}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0057d9] text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.26)] transition hover:bg-[#004cc2] disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              <Calendar className="h-5 w-5" />
              {listing.reservationEnabled === false
                ? "Rezervasyon Kapalı"
                : terms.action}
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
            <Clock className="h-5 w-5 text-[#0057d9]" />
            Çalışma Saatleri
          </h3>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-950">
                  Bugün ({currentDayName})
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  İşletme şu an {listing.isOpen ? "açık" : "kapalı"}.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  listing.isOpen
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {todayHours.time}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleHours}
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-white py-3 text-xs font-black text-slate-600 transition hover:text-[#0057d9]"
            >
              {showAllHours ? "Diğer günleri gizle" : "Tüm haftayı gör"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAllHours ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <AnimatePresence>
            {showAllHours && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {hoursList.map((h, i) => (
                    <div
                      key={i}
                      className={`flex justify-between rounded-xl px-3 py-2 text-sm ${
                        h.day === currentDayName
                          ? "bg-blue-50 font-black text-[#0057d9]"
                          : "text-slate-500"
                      }`}
                    >
                      <span>{h.day}</span>
                      <span>{h.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <h3 className="mb-5 text-xl font-black text-slate-950">
            Değerlendirme Özeti
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
              <span className="text-3xl font-black text-amber-500">
                {rating > 0 ? rating.toFixed(1) : "—"}
              </span>
            </div>

            <div>
              <div className="mb-2 flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i <= Math.round(rating)
                        ? "fill-current"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm font-semibold text-slate-500">
                {reviews > 0
                  ? `${reviews} kullanıcı değerlendirdi`
                  : "Henüz değerlendirme yok"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}