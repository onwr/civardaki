"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { CalendarDays, FileSpreadsheet, Filter, LayoutList } from "lucide-react";
import { toast } from "sonner";

const BRAND = "#004aad";

/** Filtre rozetleri — açıkken dolu renk, kapalıyken slate şablonu */
const FILTER_CHIPS = [
  {
    id: "overdue_check",
    label: "Vadesi Geçen Çek/Senet",
    on: "bg-rose-600 text-white shadow-md shadow-rose-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 hover:ring-slate-300",
  },
  {
    id: "overdue_expense",
    label: "Vadesi Geçen Masraf",
    on: "bg-slate-700 text-white shadow-md shadow-slate-900/15",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
  },
  {
    id: "upcoming_check",
    label: "Yaklaşan Çek/Senet",
    on: "bg-lime-600 text-white shadow-md shadow-lime-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-lime-50 hover:ring-lime-200",
  },
  {
    id: "upcoming_expense",
    label: "Yaklaşan Masraf",
    on: "bg-sky-500 text-white shadow-md shadow-sky-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-sky-50 hover:ring-sky-200",
  },
  {
    id: "invoices",
    label: "Alış-Satış Faturaları",
    on: "bg-orange-500 text-white shadow-md shadow-orange-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:ring-orange-200",
  },
  {
    id: "shipping",
    label: "Sevk Tarihleri",
    on: "bg-emerald-600 text-white shadow-md shadow-emerald-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:ring-emerald-200",
  },
  {
    id: "loan",
    label: "Kredi Ödemeleri",
    on: "bg-lime-700 text-white shadow-md shadow-lime-900/15",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-lime-50 hover:ring-lime-300",
  },
  {
    id: "notes",
    label: "Notlarınız",
    on: "bg-teal-600 text-white shadow-md shadow-teal-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200",
  },
  {
    id: "other",
    label: "Diğer",
    on: "bg-violet-600 text-white shadow-md shadow-violet-900/10",
    off: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-violet-50 hover:ring-violet-200",
  },
];

const ALL_FILTER_IDS = FILTER_CHIPS.map((c) => c.id);

const CHIP_COLORS = {
  overdue_check: "bg-rose-600 text-white",
  overdue_expense: "bg-slate-600 text-white",
  upcoming_check: "bg-lime-600 text-white",
  upcoming_expense: "bg-sky-500 text-white",
  invoices: "bg-orange-500 text-white",
  shipping: "bg-emerald-700 text-white",
  loan: "bg-lime-700 text-white",
  notes: "bg-teal-600 text-white",
  other: "bg-violet-600 text-white",
};

const TR_EVENT_CATEGORY = {
  RESERVATION: "Rezervasyon",
  TASK: "Not / Görev",
  APPOINTMENT: "Randevu",
  SUPPLIER: "Sevk / Tedarik",
};

const TR_CALENDAR_STATUS = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal edildi",
  COMPLETED: "Tamamlandı",
};

const TR_RESERVATION_STATUS = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal edildi",
};

const TR_SOURCE = {
  CALENDAR: "Takvim kaydı",
  RESERVATION: "Randevu",
};

const TR_PRIORITY = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

function trCategoryLabel(ev) {
  if (ev.source === "RESERVATION") return "Randevu (sistem)";
  return TR_EVENT_CATEGORY[ev.category] || ev.category;
}

function trStatusLabel(ev) {
  if (ev.source === "RESERVATION") {
    return TR_RESERVATION_STATUS[ev.status] || ev.status;
  }
  return TR_CALENDAR_STATUS[ev.status] || ev.status;
}

function trSourceLabel(ev) {
  return TR_SOURCE[ev.source] || ev.source;
}

function trPriorityLabel(p) {
  return TR_PRIORITY[p] || p || "—";
}

function toLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getEventFilterId(ev) {
  if (ev.source === "RESERVATION") return "other";
  switch (ev.category) {
    case "TASK":
      return "notes";
    case "APPOINTMENT":
      return "upcoming_expense";
    case "SUPPLIER":
      return "shipping";
    case "RESERVATION":
      return "invoices";
    default:
      return "other";
  }
}

function monthGridDays(monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const gridStart = startOfWeek(start, { weekStartsOn: 1, locale: tr });
  const gridEnd = endOfWeek(end, { weekStartsOn: 1, locale: tr });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

function isWeekendDay(d) {
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

function formatDurationMinutes(startIso, endIso) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} sa ${rem} dk` : `${h} sa`;
}

function SectionCard({ title, subtitle, right, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function CalendarHubPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetDate, setModalTargetDate] = useState(() => new Date());
  const [modalNonce, setModalNonce] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    occupancy: 0,
    pendingRequests: 0,
    totalScheduled: 0,
  });

  const [filterOn, setFilterOn] = useState(() =>
    Object.fromEntries(ALL_FILTER_IDS.map((id) => [id, true])),
  );

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const sm = startOfMonth(currentMonth);
      const em = endOfMonth(currentMonth);
      const from = toLocalYMD(sm);
      const to = toLocalYMD(em);
      const res = await fetch(
        `/api/business/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents(data.events || []);
      setStats((prev) => ({ ...prev, ...(data.stats || {}) }));
    } catch (error) {
      console.error(error);
      toast.error("Takvim verisi yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(
    () => events.filter((ev) => filterOn[getEventFilterId(ev)]),
    [events, filterOn],
  );

  const eventsByYmd = useMemo(() => {
    const map = new Map();
    for (const ev of filteredEvents) {
      const ymd = toLocalYMD(new Date(ev.startTime));
      if (!map.has(ymd)) map.set(ymd, []);
      map.get(ymd).push(ev);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
    return map;
  }, [filteredEvents]);

  const gridDays = useMemo(() => monthGridDays(currentMonth), [currentMonth]);

  const monthTitle = useMemo(
    () =>
      currentMonth.toLocaleString("tr-TR", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );

  const weekHeaders = ["Pts", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];

  const toggleFilter = (id) => {
    setFilterOn((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goPrevMonth = () => setCurrentMonth((p) => addMonths(p, -1));
  const goNextMonth = () => setCurrentMonth((p) => addMonths(p, 1));

  const goToday = () => {
    const t = new Date();
    setCurrentMonth(t);
    setSelectedDate(t);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const openNoteModal = (day) => {
    setEditingEvent(null);
    setModalTargetDate(day);
    setSelectedDate(day);
    setModalNonce((n) => n + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (ev, e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (ev.source !== "CALENDAR" || ev.readOnly) return;
    const d = new Date(ev.startTime);
    setEditingEvent(ev);
    setModalTargetDate(d);
    setSelectedDate(d);
    setModalNonce((n) => n + 1);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const start = new Date(modalTargetDate);
    const [h, m] = String(data.time || "09:00").split(":");
    start.setHours(parseInt(h, 10) || 9, parseInt(m, 10) || 0, 0, 0);

    const durationMs = editingEvent
      ? Math.max(
          60000,
          new Date(editingEvent.endTime).getTime() - new Date(editingEvent.startTime).getTime(),
        )
      : 60 * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    const payload = {
      title: String(data.title || "").trim(),
      customerName: data.customerName ? String(data.customerName).trim() : null,
      description: data.description ? String(data.description).trim() : null,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      category: data.category || "TASK",
      priority: data.priority || "MEDIUM",
      status: data.status || "CONFIRMED",
    };

    try {
      if (editingEvent) {
        const res = await fetch("/api/business/calendar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEvent.id, ...payload }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        toast.success("Kayıt güncellendi.");
      } else {
        const res = await fetch("/api/business/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        toast.success("Kayıt eklendi.");
      }
      closeModal();
      fetchEvents();
    } catch {
      toast.error(editingEvent ? "Güncellenemedi." : "Kayıt eklenemedi.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/calendar?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Silindi.");
        fetchEvents();
      } else toast.error("Silinemedi.");
    } catch {
      toast.error("Hata oluştu.");
    }
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = filteredEvents.map((ev) => ({
        Tarih: toLocalYMD(new Date(ev.startTime)),
        Saat: format(new Date(ev.startTime), "HH:mm"),
        Başlık: ev.title,
        Müşteri: ev.customerName || "",
        Kaynak: trSourceLabel(ev),
        Kategori: trCategoryLabel(ev),
        Durum: trStatusLabel(ev),
        Öncelik:
          ev.source === "CALENDAR" && ev.priority ? trPriorityLabel(ev.priority) : "",
      }));
      const ws = XLSX.utils.json_to_sheet(
        rows.length ? rows : [{ Bilgi: "Bu ay için gösterilen kayıt yok" }],
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Takvim");
      const fname = `takvim_${toLocalYMD(startOfMonth(currentMonth))}.xlsx`;
      XLSX.writeFile(wb, fname);
      toast.success("Excel indirildi.");
    } catch {
      toast.error("Excel oluşturulamadı.");
    }
  };

  const selectedDayEvents = eventsByYmd.get(toLocalYMD(selectedDate)) || [];

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-16 pt-6 sm:pt-8" style={{ background: "var(--bh-main-bg, #eef2f6)" }}>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Hero — LeadsClient ile aynı dil */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  Planlama ve hatırlatmalar
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">İşletme takvimi</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Randevular ve takvim kayıtlarınızı tek aydın görün. Boş bir güne tıklayarak not
                  ekleyin; filtrelerle kayıt türlerini daraltın.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Bu ay (tümü)</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{stats.totalScheduled ?? 0}</p>
                  <p className="text-xs text-white/60">kayıt</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Bekleyen</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-amber-200">
                    {stats.pendingRequests ?? 0}
                  </p>
                  <p className="text-xs text-white/60">randevu</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Görünen</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-200">
                    {filteredEvents.length}
                  </p>
                  <p className="text-xs text-white/60">filtre sonrası</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          title="Filtreler ve dışa aktarma"
          subtitle="Kategorilere tıklayarak görünürlüğü açıp kapatabilirsiniz. Excel ile listedeki kayıtları indirirsiniz."
          right={
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-5 w-5 shrink-0" aria-hidden />
              Excel
            </button>
          }
        >
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            <Filter className="mt-0.5 h-4 w-4 shrink-0 text-[#004aad]" aria-hidden />
            <p>
              İstediğiniz gün kutusunda <strong className="text-slate-800">boş alana tıklayarak</strong> yeni
              not ekleyebilirsiniz. Gün numarasına tıklamak sadece o günü seçer.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleFilter(chip.id)}
                className={`rounded-full px-3 py-1.5 text-center text-[10px] font-bold leading-snug transition sm:text-xs ${
                  filterOn[chip.id] ? chip.on : chip.off
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={monthTitle}
          subtitle="Ay navigasyonu ve haftalık görünüm"
          right={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-[#004aad]/30 hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200/60"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={goPrevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60"
                aria-label="Önceki ay"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60"
                aria-label="Sonraki ay"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          }
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
            {isLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div
                  className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-[#004aad]"
                  aria-hidden
                />
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px] grid-cols-7 bg-white">
                {weekHeaders.map((label, i) => (
                  <div
                    key={label}
                    className={`border-b border-slate-200 py-3 text-center text-xs font-bold uppercase tracking-wide sm:text-sm ${
                      i >= 5 ? "bg-rose-50/80 text-rose-700" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {label}
                  </div>
                ))}

                {gridDays.map((day) => {
                  const ymd = toLocalYMD(day);
                  const inMonth = isSameMonth(day, currentMonth);
                  const selected = isSameDay(day, selectedDate);
                  const wknd = isWeekendDay(day);
                  const dayEvents = eventsByYmd.get(ymd) || [];

                  return (
                    <div
                      key={ymd}
                      className={`relative min-h-[104px] border-b border-r border-slate-200 p-1.5 last:border-r-0 sm:min-h-[124px] sm:p-2 ${
                        !inMonth ? "bg-slate-50/90" : "bg-white"
                      } ${
                        selected
                          ? "bg-[#004aad]/[0.06] ring-2 ring-inset ring-[#004aad]/25"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`absolute right-1.5 top-1.5 z-[1] flex h-8 min-w-8 items-center justify-center rounded-xl text-sm font-bold transition sm:right-2 sm:top-2 ${
                          !inMonth
                            ? "text-slate-400"
                            : wknd
                              ? "text-rose-600"
                              : "text-slate-900"
                        } ${
                          selected
                            ? "bg-[#004aad] text-white shadow-md shadow-[#004aad]/25"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        {day.getDate()}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNoteModal(day);
                        }}
                        className="absolute inset-0 z-0 cursor-pointer"
                        aria-label={`${ymd} için yeni not`}
                      />

                      <div className="pointer-events-none relative z-[2] mt-9 flex max-h-[76px] flex-col gap-1 overflow-hidden sm:max-h-[92px]">
                        {dayEvents.slice(0, 4).map((ev) => {
                          const fid = getEventFilterId(ev);
                          const chipClass = CHIP_COLORS[fid] || CHIP_COLORS.other;
                          const canEdit = ev.source === "CALENDAR" && !ev.readOnly;
                          return (
                            <button
                              key={`${ev.source}-${ev.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canEdit) openEditModal(ev, e);
                              }}
                              className={`pointer-events-auto w-full truncate rounded-lg px-1.5 py-0.5 text-left text-[9px] font-bold leading-tight text-white shadow-sm sm:text-[10px] ${chipClass} ${canEdit ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
                              title={
                                canEdit
                                  ? `${ev.title} — Düzenlemek için tıklayın`
                                  : ev.title
                              }
                            >
                              {new Date(ev.startTime).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              {ev.title}
                            </button>
                          );
                        })}
                        {dayEvents.length > 4 ? (
                          <span className="pl-0.5 text-[10px] font-bold text-slate-500">
                            +{dayEvents.length - 4} daha
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Seçili gün"
          subtitle={selectedDate.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          right={
            <p className="text-xs font-semibold text-slate-500">
              Yoğunluk %{stats.occupancy ?? 0}
            </p>
          }
        >
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
              <LayoutList className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="max-w-md text-sm text-slate-600">
                Bu tarihte gösterilecek kayıt yok. Takvimde ilgili güne tıklayıp{" "}
                <strong className="text-slate-800">boş alandan</strong> yeni not ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedDayEvents.map((ev) => (
                <li
                  key={`${ev.source}-${ev.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{ev.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(ev.startTime).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {formatDurationMinutes(ev.startTime, ev.endTime)}
                      {ev.customerName ? (
                        <span className="text-slate-500"> · {ev.customerName}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      <span>{trCategoryLabel(ev)}</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span>{trStatusLabel(ev)}</span>
                      {ev.source === "CALENDAR" && ev.priority ? (
                        <>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span className="text-slate-500">
                            Öncelik: {trPriorityLabel(ev.priority)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {ev.source === "RESERVATION" ? (
                      <Link
                        href="/business/reservations"
                        className="rounded-xl border border-[#004aad]/20 bg-[#004aad]/5 px-3 py-1.5 text-xs font-bold text-[#004aad] transition hover:bg-[#004aad]/10"
                      >
                        Randevular
                      </Link>
                    ) : null}
                    {ev.source === "CALENDAR" && !ev.readOnly ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(ev)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#004aad]/30 hover:text-[#004aad]"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ev.id)}
                          className="rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          Sil
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            >
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#004aad]/10 shadow-inner">
                      <CalendarIcon className="h-7 w-7 text-[#004aad]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {editingEvent ? "Görevi düzenle" : "Yeni not"}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {modalTargetDate.toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Kapat"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form
                key={`${editingEvent?.id ?? "new"}-${modalNonce}`}
                onSubmit={handleFormSubmit}
                className="space-y-4 p-6"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Başlık
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={editingEvent?.title ?? ""}
                    placeholder="Kısa başlık"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Müşteri / İlgili (isteğe bağlı)
                  </label>
                  <input
                    name="customerName"
                    defaultValue={editingEvent?.customerName ?? ""}
                    placeholder="İsim"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Not
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingEvent?.description ?? ""}
                    placeholder="Açıklama"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Saat (başlangıç)
                    </label>
                    <div className="relative">
                      <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#004aad]" />
                      <input
                        type="time"
                        name="time"
                        defaultValue={
                          editingEvent
                            ? format(new Date(editingEvent.startTime), "HH:mm")
                            : "09:00"
                        }
                        required
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                      />
                    </div>
                    {editingEvent ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Süre aynı kalır; bitiş saati başlangıca göre otomatik güncellenir.
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tür
                    </label>
                    <select
                      name="category"
                      defaultValue={editingEvent?.category ?? "TASK"}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                    >
                      <option value="TASK">Not / Görev</option>
                      <option value="APPOINTMENT">Randevu</option>
                      <option value="RESERVATION">Rezervasyon kaydı</option>
                      <option value="SUPPLIER">Sevk / Tedarik</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Öncelik
                    </label>
                    <select
                      name="priority"
                      defaultValue={editingEvent?.priority ?? "MEDIUM"}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Durum
                    </label>
                    <select
                      name="status"
                      defaultValue={editingEvent?.status ?? "CONFIRMED"}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                    >
                      <option value="PENDING">Beklemede</option>
                      <option value="CONFIRMED">Onaylandı</option>
                      <option value="COMPLETED">Tamamlandı</option>
                      <option value="CANCELLED">İptal edildi</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-12 flex-1 rounded-2xl text-sm font-bold text-white shadow-lg shadow-[#004aad]/25 transition hover:opacity-95"
                    style={{ backgroundColor: BRAND }}
                  >
                    {editingEvent ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
