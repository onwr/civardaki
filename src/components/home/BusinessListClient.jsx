"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Filter, X, Loader2 } from "lucide-react";
import { turkeyLocations, getDistricts } from "@/constants/locations";
import BusinessCard from "@/components/home/BusinessCard";

function toQS(obj) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim() !== "")
      sp.set(k, String(v).trim());
  });
  return sp.toString();
}

export default function BusinessListClient({
  initialCategory = "",
  initialSearch = "",
  syncFromUrl = false,
  showSeoSection = true,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromUrl = useMemo(() => {
    if (!syncFromUrl) return {};
    return {
      q: searchParams.get("q") ?? "",
      city: searchParams.get("city") ?? "",
      district: searchParams.get("district") ?? "",
      category: searchParams.get("category") ?? "",
      sort: searchParams.get("sort") ?? "newest",
    };
  }, [syncFromUrl, searchParams]);

  const [q, setQ] = useState(fromUrl.q || initialSearch);
  const [city, setCity] = useState(fromUrl.city || "");
  const [district, setDistrict] = useState(fromUrl.district || "");
  const [category, setCategory] = useState(fromUrl.category || initialCategory);
  const [sort, setSort] = useState(fromUrl.sort || "newest");

  const [filtersMeta, setFiltersMeta] = useState({
    cityCounts: [],
    categoryCounts: [],
    districtCounts: [],
  });
  const [categoriesDict, setCategoriesDict] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const districts = useMemo(() => (city ? getDistricts(city) : []), [city]);

  useEffect(() => {
    if (syncFromUrl && Object.keys(fromUrl).length) {
      setQ(fromUrl.q);
      setCity(fromUrl.city);
      setDistrict(fromUrl.district);
      setCategory(fromUrl.category);
      setSort(fromUrl.sort);
    }
  }, [
    syncFromUrl,
    fromUrl.q,
    fromUrl.city,
    fromUrl.district,
    fromUrl.category,
    fromUrl.sort,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setCategoriesDict(data.categories || []);
        }
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const qs = toQS({ city });
        const res = await fetch(`/api/public/businesses/filters?${qs}`, {
          cache: "no-store",
        });
        if (res.ok) setFiltersMeta(await res.json());
      } catch {}
    };
    run();
  }, [city]);

  useEffect(() => {
    if (syncFromUrl) return;
    setDistrict("");
    setCategory("");
  }, [city, syncFromUrl]);

  const fetchFirstPage = async () => {
    setLoading(true);
    try {
      const qs = toQS({ q, city, district, category, sort, page: 1, limit });
      const res = await fetch(`/api/public/businesses?${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setItems([]);
        setPage(1);
        setTotalPages(1);
        return;
      }
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      setItems(data.items || []);
      setPage(1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setItems([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const qs = toQS({ q, city, district, category, sort, page: next, limit });
      const res = await fetch(`/api/public/businesses?${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      setItems((prev) => [...prev, ...(data.items || [])]);
      setPage(next);
      setTotalPages(data.pagination?.totalPages || totalPages);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchFirstPage(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, district, category, sort]);

  const updateUrl = () => {
    if (!syncFromUrl) return;
    const params = toQS({ q, city, district, category, sort });
    const path = params ? `/search?${params}` : "/search";
    router.replace(path, { scroll: false });
  };

  useEffect(() => {
    if (syncFromUrl) updateUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, district, category, sort]);

  const clearFilters = () => {
    setQ("");
    setCity("");
    setDistrict("");
    setCategory("");
    setSort("newest");
  };

  const activeFilters = [q, city, district, category].filter(Boolean);
  const hasActiveFilters = activeFilters.length > 0;
  const resultsTitle = q
    ? `"${q}" için sonuçlar`
    : city
      ? district
        ? `${city} / ${district}`
        : `${city}`
      : "Tüm İşletmeler";

  return (
    <div className="min-h-screen bg-gray-50">
      {syncFromUrl && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 md:pt-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {resultsTitle}
            </h1>
            {hasActiveFilters && (
              <div className="mt-2 flex flex-wrap gap-2">
                {q && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                    Anahtar: {q}
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                    Şehir: {city}
                  </span>
                )}
                {district && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                    İlçe: {district}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                    Kategori: {category}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 md:pt-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="İşletme adı veya açıklamada ara..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-base min-h-[48px] md:min-h-0"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Şehir
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-base min-h-[48px] md:min-h-0"
                >
                  <option value="">Tümü</option>
                  {Object.keys(turkeyLocations)
                    .sort()
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  İlçe
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 text-slate-900 text-base min-h-[48px] md:min-h-0"
                >
                  <option value="">{city ? "Tümü" : "Önce şehir seç"}</option>
                  {districts.map((d) => {
                    const countObj = filtersMeta.districtCounts?.find(
                      (x) => x.district === d,
                    );
                    const countLabel = countObj ? ` (${countObj.count})` : "";
                    return (
                      <option key={d} value={d}>
                        {d}
                        {countLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-base min-h-[48px] md:min-h-0"
                >
                  <option value="">Tümü</option>
                  {categoriesDict.map((c, i) => (
                    <option
                      key={c.slug ?? c.raw ?? `cat-${i}`}
                      value={c.slug ?? c.raw}
                    >
                      {c.name ?? c.displayName} ({c.count})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Sırala
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-base min-h-[48px] md:min-h-0"
                >
                  <option value="newest">En Yeni</option>
                  <option value="popular">Popüler (yakında)</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Filter className="h-4 w-4" />
                {filtersMeta.cityCounts?.length ? (
                  <span>
                    {city ? (
                      <>
                        <span className="text-slate-900">{city}</span> içinde{" "}
                        <span className="text-blue-600">
                          {filtersMeta.categoryCounts?.reduce(
                            (a, b) => a + b.count,
                            0,
                          ) || 0}
                        </span>{" "}
                        işletme
                      </>
                    ) : (
                      <>
                        Toplam{" "}
                        <span className="text-blue-600">
                          {filtersMeta.cityCounts.reduce(
                            (a, b) => a + b.count,
                            0,
                          )}
                        </span>{" "}
                        işletme
                      </>
                    )}
                  </span>
                ) : (
                  <span>Filtre verileri yükleniyor…</span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center">
            <div className="text-3xl">😕</div>
            <h3 className="mt-3 text-xl font-black text-slate-900">
              Sonuç bulunamadı
            </h3>
            <p className="mt-2 text-slate-500 font-semibold">
              Filtreleri genişletmeyi deneyin.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              {page < totalPages ? (
                <button
                  onClick={fetchMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Daha Fazla Yükle
                </button>
              ) : (
                <div className="text-xs font-bold text-slate-400">
                  Hepsi bu kadar.
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showSeoSection && (
        <section className="mx-auto max-w-6xl px-6 py-20 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-sm">
              <h2 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight">
                Popüler <span className="text-blue-600">Hizmet Bölgeleri</span>
              </h2>
              <p className="mt-4 text-slate-500 font-bold text-sm leading-relaxed">
                Türkiye&apos;nin en aktif şehirlerinde binlerce profesyonel
                Civardaki ile parmağınızın ucunda. Hemen bir kategori seçip
                keşfetmeye başlayın.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Ankara
                </h3>
                <ul className="space-y-3">
                  {["Temizlik", "Kombi", "Cilingir"].map((cat) => (
                    <li key={cat}>
                      <a
                        href={`/ankara/${cat.toLowerCase()}`}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {cat} Servisi
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Istanbul
                </h3>
                <ul className="space-y-3">
                  {["Temizlik", "Dis-Klinigi", "Tesisatçı"].map((cat) => (
                    <li key={cat}>
                      <a
                        href={`/istanbul/${cat.toLowerCase()}`}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Izmir
                </h3>
                <ul className="space-y-3">
                  {["Temizlik", "Oto-Tamir", "Boyaci"].map((cat) => (
                    <li key={cat}>
                      <a
                        href={`/izmir/${cat.toLowerCase()}`}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Bursa
                </h3>
                <ul className="space-y-3">
                  {["Temizlik", "Nakliyat", "Bahce"].map((cat) => (
                    <li key={cat}>
                      <a
                        href={`/bursa/${cat.toLowerCase()}`}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
