"use client";

import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "name", label: "Ad" },
  { value: "slug", label: "Slug" },
  { value: "sortOrder", label: "Sıra" },
  { value: "level", label: "Seviye" },
  { value: "createdAt", label: "Kayıt tarihi" },
];

export default function CategoryFiltersBar({ filters, onChange }) {
  const { q, parentId, isActive, isFeatured, sortBy, sortOrder, pageSize } = filters || {};

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
            placeholder="Ad veya slug ile ara..."
            value={q ?? ""}
            onChange={(e) => set("q", e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
        </div>

        <select
          value={parentId ?? "all"}
          onChange={(e) => set("parentId", e.target.value === "all" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="all">Tüm kategoriler</option>
          <option value="root">Sadece üst kategoriler</option>
        </select>

        <select
          value={isActive ?? ""}
          onChange={(e) => set("isActive", e.target.value === "" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Durum</option>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>

        <select
          value={isFeatured ?? ""}
          onChange={(e) => set("isFeatured", e.target.value === "" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Öne çıkan</option>
          <option value="true">Evet</option>
          <option value="false">Hayır</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sıra:</span>
          <select
            value={sortBy ?? "sortOrder"}
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
