"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";

function buildQuery(next) {
  const q = new URLSearchParams();
  Object.entries(next).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

export default function CivardakiMagazaFilters({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo(() => {
    const page = sp.get("page") || "1";
    const pageSize = sp.get("pageSize") || "24";
    return {
      q: sp.get("q") || "",
      categoryId: sp.get("categoryId") || "",
      min: sp.get("min") || "",
      max: sp.get("max") || "",
      inStockOnly: sp.get("inStockOnly") || "",
      sort: sp.get("sort") || "updatedDesc",
      page,
      pageSize,
    };
  }, [sp]);

  const [draftQ, setDraftQ] = useState(current.q);

  const push = (patch) => {
    const next = { ...current, ...patch, page: "1" };
    const qs = buildQuery(next);
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onSubmitSearch = (e) => {
    e.preventDefault();
    push({ q: draftQ });
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Filter className="h-4 w-4" />
        Filtreler
      </div>

      <form onSubmit={onSubmitSearch} className="mt-3 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Arama</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="Ürün, marka, açıklama..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Kategori</label>
          <select
            value={current.categoryId}
            onChange={(e) => push({ categoryId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Tümü</option>
            <option value="null">Kategorisiz</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Min ₺</label>
          <input
            value={current.min}
            onChange={(e) => push({ min: e.target.value })}
            inputMode="decimal"
            placeholder="0"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Max ₺</label>
          <input
            value={current.max}
            onChange={(e) => push({ max: e.target.value })}
            inputMode="decimal"
            placeholder="9999"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Sıralama</label>
          <select
            value={current.sort}
            onChange={(e) => push({ sort: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="updatedDesc">Güncellenen (Yeni)</option>
            <option value="newest">Eklenen (Yeni)</option>
            <option value="priceAsc">Fiyat (Artan)</option>
            <option value="priceDesc">Fiyat (Azalan)</option>
            <option value="nameAsc">İsim (A-Z)</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Stok</label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={current.inStockOnly === "1"}
              onChange={(e) => push({ inStockOnly: e.target.checked ? "1" : "" })}
            />
            Sadece stokta olanlar
          </label>
        </div>

        <div className="md:col-span-6 flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Uygula
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftQ("");
              router.push(pathname);
            }}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sıfırla
          </button>
        </div>
      </form>
    </div>
  );
}

