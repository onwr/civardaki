"use client";

import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarDaysIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { STATUS_FILTER_OPTIONS } from "../lib/order-status";

export default function OrdersToolbar({
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  filterStatus,
  onFilterStatusChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <section className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
          <FunnelIcon className="h-5 w-5 text-[#0057d9]" />
        </div>

        <div>
          <h2 className="font-black text-slate-950">Sipariş Filtreleri</h2>
          <p className="text-sm text-slate-500">
            Siparişleri müşteri, tarih ve duruma göre filtreleyin.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Sipariş no veya müşteri adı ara..."
            aria-label="Sipariş veya müşteri ara"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-13 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0057d9] focus:bg-white"
            value={searchTerm ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <CalendarDaysIcon className="h-5 w-5 text-slate-400" />

            <input
              type="date"
              value={dateFrom ?? ""}
              onChange={(e) => onDateFromChange(e.target.value)}
              aria-label="Başlangıç tarihi"
              className="h-14 bg-transparent text-sm font-bold text-slate-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <CalendarDaysIcon className="h-5 w-5 text-slate-400" />

            <input
              type="date"
              value={dateTo ?? ""}
              onChange={(e) => onDateToChange(e.target.value)}
              aria-label="Bitiş tarihi"
              className="h-14 bg-transparent text-sm font-bold text-slate-700 outline-none"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                onDateFromChange("");
                onDateToChange("");
              }}
              className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              Tarihi Temizle
            </button>
          )}

          <div className="flex h-14 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                viewMode === "grid"
                  ? "bg-white text-[#0057d9] shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Kart görünümü"
              aria-pressed={viewMode === "grid"}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                viewMode === "list"
                  ? "bg-white text-[#0057d9] shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Liste görünümü"
              aria-pressed={viewMode === "list"}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto border-t border-slate-100 pt-5">
        {STATUS_FILTER_OPTIONS.map((status) => (
          <button
            key={status.id}
            type="button"
            onClick={() => onFilterStatusChange(status.id)}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
              filterStatus === status.id
                ? "bg-[#0057d9] text-white shadow-[0_12px_26px_rgba(0,87,217,0.20)]"
                : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0057d9]"
            }`}
            aria-pressed={filterStatus === status.id}
          >
            {status.label}
          </button>
        ))}
      </div>
    </section>
  );
}