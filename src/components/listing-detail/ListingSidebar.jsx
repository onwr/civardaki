"use client";

import { MapPin, Phone, Globe, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
    hoursList[0] ||
    { day: currentDayName, time: "—" };

  const mapUrl = listing.coordinates
    ? `https://www.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}`
    : null;

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" /> İletişim & Konum
          </h3>

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack?.("CLICK_CTA_PRIMARY")}
              className="relative block h-44 bg-slate-100 rounded-xl mb-5 overflow-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80"
                alt="Harita"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold shadow-lg">
                  <MapPin className="w-4 h-4" /> Haritada Gör
                </span>
              </div>
            </a>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-sm text-slate-600 pt-2 leading-relaxed">
                {listing.location}
              </p>
            </div>
            {listing.phone && (
              <a
                href={`tel:${listing.phone}`}
                onClick={() => onTrack?.("CLICK_PHONE")}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {listing.phone}
                </span>
              </a>
            )}
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrack?.("CLICK_WEBSITE")}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  Web sitesi
                </span>
              </a>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onReservationClick}
              disabled={listing.reservationEnabled === false}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />{" "}
              {listing.reservationEnabled === false
                ? "Rezervasyon Kapalı"
                : terms.action}
            </button>
            {listing.reservationEnabled === false && (
              <p className="mt-2 text-xs text-rose-500 font-semibold">
                İşletme şu anda rezervasyon kabul etmiyor.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" /> Çalışma Saatleri
          </h3>
          <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-700 font-semibold text-sm">
                Bugün ({currentDayName})
              </span>
              <span className="text-slate-900 font-semibold text-sm">
                {todayHours.time}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              İşletme şu an {listing.isOpen ? "açık" : "kapalı"}.
            </p>
            <button
              type="button"
              onClick={onToggleHours}
              className="w-full mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              {showAllHours ? "Diğer günleri gizle" : "Tüm haftayı gör"}{" "}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showAllHours ? "rotate-180" : ""}`}
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
                <div className="pt-4 space-y-2 border-t border-slate-100 mt-4">
                  {hoursList.map((h, i) => (
                    <div
                      key={i}
                      className={`flex justify-between text-sm py-1 ${
                        h.day === currentDayName
                          ? "font-semibold text-slate-900 bg-slate-50 -mx-2 px-2 rounded-lg"
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
        </div>
      </div>
    </div>
  );
}
