"use client";

import { MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 flex-wrap">
          <div className="relative flex-1 min-w-0 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Sipariş no, müşteri adı..."
              aria-label="Sipariş veya müşteri ara"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-400/20 outline-none transition-colors"
              value={searchTerm ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom ?? ""}
              onChange={(e) => onDateFromChange(e.target.value)}
              aria-label="Başlangıç tarihi"
              className="h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium min-w-[130px] focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 outline-none"
            />
            <input
              type="date"
              value={dateTo ?? ""}
              onChange={(e) => onDateToChange(e.target.value)}
              aria-label="Bitiş tarihi"
              className="h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium min-w-[130px] focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 outline-none"
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  onDateFromChange("");
                  onDateToChange("");
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[40px]"
              >
                Tarihi temizle
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-w-[36px] min-h-[36px] ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              title="Kart görünümü"
              aria-pressed={viewMode === "grid"}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-w-[36px] min-h-[36px] ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              title="Liste görünümü"
              aria-pressed={viewMode === "list"}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar border-t border-slate-100 pt-4">
          {STATUS_FILTER_OPTIONS.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => onFilterStatusChange(status.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-[32px] ${filterStatus === status.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-slate-200"}`}
              aria-pressed={filterStatus === status.id}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
