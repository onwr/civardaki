"use client";

import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "expiresAt", label: "Bitiş tarihi" },
  { value: "startedAt", label: "Başlangıç tarihi" },
  { value: "plan", label: "Plan" },
  { value: "status", label: "Durum" },
  { value: "createdAt", label: "Kayıt tarihi" },
];

export default function SubscriptionFiltersBar({ filters, onChange }) {
  const { q, status, plan, expiring, sortBy, sortOrder, pageSize } = filters || {};

  const set = (key, value) => {
    if (typeof onChange !== "function") return;
    const resetPage = key !== "pageSize" && key !== "sortBy" && key !== "sortOrder";
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
          <option value="TRIAL">Deneme</option>
          <option value="ACTIVE">Aktif</option>
          <option value="EXPIRED">Süresi doldu</option>
        </select>

        <select
          value={plan ?? ""}
          onChange={(e) => set("plan", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm planlar</option>
          <option value="BASIC">Temel</option>
          <option value="PREMIUM">Premium</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={expiring === "30"}
            onChange={(e) => set("expiring", e.target.checked ? "30" : undefined)}
            className="rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm text-slate-700">30 günde bitenler</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sıra:</span>
          <select
            value={sortBy ?? "expiresAt"}
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
            value={sortOrder ?? "asc"}
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
