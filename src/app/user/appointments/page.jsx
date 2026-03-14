"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  RefreshCcw,
} from "lucide-react";

const STATUS_META = {
  PENDING: { label: "Beklemede", className: "text-amber-600 bg-amber-50", icon: Clock },
  CONFIRMED: { label: "Onaylandı", className: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
  COMPLETED: { label: "Tamamlandı", className: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  CANCELLED: { label: "İptal", className: "text-rose-600 bg-rose-50", icon: XCircle },
};

function formatDateTime(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
  return {
    date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    time: date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState([]);
  const [cancellingId, setCancellingId] = useState("");

  const fetchReservations = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/reservations", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Randevular yüklenemedi.");
        return;
      }
      setReservations(Array.isArray(data.reservations) ? data.reservations : []);
    } catch {
      setError("Randevular yüklenirken bir hata oluştu.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const canCancelReservation = (item) => {
    const status = (item?.status || "").toUpperCase();
    if (status !== "PENDING" && status !== "CONFIRMED") return false;
    const startMs = new Date(item?.startAt).getTime();
    if (Number.isNaN(startMs)) return false;
    return startMs - Date.now() >= 24 * 60 * 60 * 1000;
  };

  const handleCancelReservation = async (reservationId) => {
    if (!reservationId || cancellingId) return;
    setCancellingId(reservationId);
    try {
      const res = await fetch(`/api/user/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Randevu iptal edilemedi.");
        return;
      }
      toast.success("Randevu iptal edildi.");
      await fetchReservations(true);
    } catch {
      toast.error("Randevu iptali sırasında hata oluştu.");
    } finally {
      setCancellingId("");
    }
  };

  const nextReservation = useMemo(() => {
    const now = Date.now();
    return [...reservations]
      .filter((item) => {
        const status = (item.status || "").toUpperCase();
        const start = new Date(item.startAt).getTime();
        return (status === "PENDING" || status === "CONFIRMED") && start > now;
      })
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0];
  }, [reservations]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const sorted = [...reservations].sort(
      (a, b) => new Date(b.startAt) - new Date(a.startAt),
    );
    if (filter === "all") return sorted;
    if (filter === "upcoming") {
      return sorted.filter((item) => {
        const status = (item.status || "").toUpperCase();
        return (status === "PENDING" || status === "CONFIRMED") && new Date(item.startAt).getTime() >= now;
      });
    }
    return sorted.filter((item) => {
      const status = (item.status || "").toUpperCase();
      return status === "COMPLETED" || status === "CANCELLED" || new Date(item.startAt).getTime() < now;
    });
  }, [reservations, filter]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-950 uppercase italic">
            Randevularım
          </h1>
          <p className="text-slate-500 font-semibold mt-2">
            Tüm rezervasyon geçmişinizi ve yaklaşan randevularınızı buradan yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchReservations(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Yenile
          </button>
          <Link
            href="/user/isletmeler"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-950 text-white font-semibold hover:bg-[#004aad] transition-colors"
          >
            Yeni Randevu <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {nextReservation && (
        <div className="rounded-3xl bg-slate-950 text-white p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-200 font-black mb-3">
            Sıradaki randevu
          </p>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tight">
            {nextReservation.serviceName}
          </h2>
          <p className="text-slate-300 mt-2">
            {nextReservation.business?.name} - {formatDateTime(nextReservation.startAt).date} /{" "}
            {formatDateTime(nextReservation.startAt).time}
          </p>
        </div>
      )}

      <section className="flex items-center gap-3">
        {[
          { id: "all", label: "Tümü" },
          { id: "upcoming", label: "Yaklaşan" },
          { id: "past", label: "Geçmiş" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              filter === item.id
                ? "bg-slate-950 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
            }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <p className="text-rose-700 font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => fetchReservations()}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const status = STATUS_META[(item.status || "").toUpperCase()] || {
                label: item.status || "Bilinmiyor",
                className: "text-slate-600 bg-slate-100",
                icon: AlertCircle,
              };
              const StatusIcon = status.icon;
              const dt = formatDateTime(item.startAt);
              const canCancel = canCancelReservation(item);
              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white rounded-3xl border border-slate-100 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative">
                        {item.businessLogo ? (
                          <img src={item.businessLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          {item.business?.name || "İşletme"}
                        </p>
                        <h3 className="text-xl font-black text-slate-900 italic">{item.serviceName}</h3>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                      <Calendar className="w-4 h-4" />
                      {dt.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                      <Clock className="w-4 h-4" />
                      {dt.time}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-500">
                      Kaynak: {item.source === "PUBLIC_LISTING" ? "İşletme Detayı" : "Panel"}
                    </p>
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === item.id}
                          onClick={() => handleCancelReservation(item.id)}
                          className="text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-60"
                        >
                          {cancellingId === item.id ? "İptal ediliyor..." : "Randevuyu İptal Et"}
                        </button>
                      )}
                      {item.business?.slug ? (
                        <Link
                          href={`/isletme/${item.business.slug}`}
                          className="text-sm font-bold text-[#004aad] inline-flex items-center gap-1"
                        >
                          İşletmeye Git <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {!canCancel &&
                    ((item.status || "").toUpperCase() === "PENDING" ||
                      (item.status || "").toUpperCase() === "CONFIRMED") && (
                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        İptal için randevu saatine en az 24 saat kalmış olmalıdır.
                      </p>
                    )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="xl:col-span-2 bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <p className="text-slate-600 font-semibold">Bu filtrede görüntülenecek randevu yok.</p>
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  toast.info("Filtre sıfırlandı.");
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Tümünü Göster
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
