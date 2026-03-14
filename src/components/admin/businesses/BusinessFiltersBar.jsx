"use client";

import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Kayıt tarihi" },
  { value: "updatedAt", label: "Güncelleme tarihi" },
  { value: "name", label: "İşletme adı" },
  { value: "leadsCount", label: "Lead sayısı" },
  { value: "reviewsCount", label: "Yorum sayısı" },
  { value: "expiresAt", label: "Abonelik bitişi" },
];

export default function BusinessFiltersBar({
  filters,
  onChange,
  categories = [],
  cities = [],
  loading = false,
}) {
  const {
    q,
    status,
    subscription,
    verified,
    ownerVerified,
    ownerStatus,
    reservationEnabled,
    category,
    city,
    plan,
    sortBy,
    sortOrder,
    pageSize,
  } = filters || {};

  const set = (key, value) => {
    if (typeof onChange !== "function") return;
    onChange({ ...filters, [key]: value, ...(key !== "pageSize" && key !== "sortBy" && key !== "sortOrder" ? { page: 1 } : {}) });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center flex-wrap">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white rounded-xl flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="İşletme adı, email, telefon, slug, sahip..."
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
          <option value="">Tüm durum</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>

        <select
          value={subscription ?? ""}
          onChange={(e) => set("subscription", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Abonelik</option>
          <option value="TRIAL">Deneme</option>
          <option value="ACTIVE">Aktif</option>
          <option value="EXPIRED">Süresi doldu</option>
        </select>

        <select
          value={verified ?? ""}
          onChange={(e) => set("verified", e.target.value === "" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Doğrulama</option>
          <option value="true">Doğrulandı</option>
          <option value="false">Doğrulanmadı</option>
        </select>

        <select
          value={ownerVerified ?? ""}
          onChange={(e) => set("ownerVerified", e.target.value === "" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Sahip mail</option>
          <option value="true">Doğrulandı</option>
          <option value="false">Doğrulanmadı</option>
        </select>

        <select
          value={ownerStatus ?? ""}
          onChange={(e) => set("ownerStatus", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Sahip durumu</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="BANNED">BANNED</option>
          <option value="PENDING">PENDING</option>
        </select>

        <select
          value={reservationEnabled ?? ""}
          onChange={(e) => set("reservationEnabled", e.target.value === "" ? undefined : e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Rezervasyon</option>
          <option value="true">Açık</option>
          <option value="false">Kapalı</option>
        </select>

        <select
          value={plan ?? ""}
          onChange={(e) => set("plan", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Plan</option>
          <option value="BASIC">Temel</option>
          <option value="PREMIUM">Premium</option>
        </select>

        <select
          value={category ?? ""}
          onChange={(e) => set("category", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none min-w-[140px]"
        >
          <option value="">Kategori</option>
          {Array.isArray(categories) &&
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          value={city ?? ""}
          onChange={(e) => set("city", e.target.value || undefined)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none min-w-[140px]"
        >
          <option value="">Şehir</option>
          {Array.isArray(cities) &&
            cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sıra:</span>
          <select
            value={sortBy ?? "createdAt"}
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
