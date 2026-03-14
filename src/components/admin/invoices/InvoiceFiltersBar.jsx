"use client";

import { Search } from "lucide-react";
import { getStatusLabel, getTypeLabel, STATUSES, TYPES } from "@/lib/admin-invoices/status-config";

const SORT_OPTIONS = [
  { value: "issueDate", label: "Kesim tarihi" },
  { value: "dueDate", label: "Vade tarihi" },
  { value: "amount", label: "Tutar" },
  { value: "status", label: "Durum" },
  { value: "createdAt", label: "Kayıt tarihi" },
];

export default function InvoiceFiltersBar({ filters, onChange }) {
  const { q, status, type, dateFrom, dateTo, sortBy, sortOrder, pageSize } = filters || {};

  const set = (key, value) => {
    if (typeof onChange !== "function") return;
    const resetPage = !["pageSize", "sortBy", "sortOrder"].includes(key);
    onChange({ ...filters, [key]: value, ...(resetPage ? { page: 1 } : {}) });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center flex-wrap">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white rounded-xl flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="İşletme adı veya slug ile ara..."
            value={q ?? ""}
            onChange={(e) => set("q", e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
        </div>

        <select
          value={status ?? ""}
          onChange={(e) => set("status", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm durumlar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>

        <select
          value={type ?? ""}
          onChange={(e) => set("type", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm tipler</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {getTypeLabel(t)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom ?? ""}
            onChange={(e) => set("dateFrom", e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
          />
          <span className="text-slate-400">–</span>
          <input
            type="date"
            value={dateTo ?? ""}
            onChange={(e) => set("dateTo", e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sıra:</span>
          <select
            value={sortBy ?? "issueDate"}
            onChange={(e) => set("sortBy", e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={sortOrder ?? "desc"}
            onChange={(e) => set("sortOrder", e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
          >
            <option value="asc">Artan</option>
            <option value="desc">Azalan</option>
          </select>
        </div>

        <select
          value={pageSize ?? 20}
          onChange={(e) => set("pageSize", Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
