"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Store,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PackageCheck,
  RefreshCw,
  LayoutGrid,
  Filter,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import CivardakiMagazaFilters from "./CivardakiMagazaFilters";
import CivardakiMagazaGrid from "./CivardakiMagazaGrid";

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
};

const ALLOWED_QUERY_KEYS = [
  "q",
  "categoryId",
  "min",
  "max",
  "inStockOnly",
  "sort",
  "page",
  "pageSize",
];

function buildQueryFromSearchParams(sp) {
  const query = new URLSearchParams();

  ALLOWED_QUERY_KEYS.forEach((key) => {
    const value = sp.get(key);
    if (value != null && value !== "") {
      query.set(key, value);
    }
  });

  return query.toString();
}

function createHrefFromQuery(qs, updates = {}) {
  const next = new URLSearchParams(qs);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });

  const str = next.toString();
  return str ? `?${str}` : "?";
}

function getVisiblePages(currentPage, totalPages) {
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

function hasAnyActiveFilter(sp) {
  return (
    !!sp.get("q") ||
    !!sp.get("categoryId") ||
    !!sp.get("min") ||
    !!sp.get("max") ||
    sp.get("inStockOnly") === "true" ||
    !!sp.get("sort")
  );
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Pagination({ qs, page, totalPages }) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Number(page || 1));
  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const visiblePages = getVisiblePages(safePage, safeTotalPages);

  const prevHref = createHrefFromQuery(qs, { page: Math.max(1, safePage - 1) });
  const nextHref = createHrefFromQuery(qs, {
    page: Math.min(safeTotalPages, safePage + 1),
  });

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          Sayfa <strong className="text-slate-900">{safePage}</strong> /{" "}
          <strong className="text-slate-900">{safeTotalPages}</strong>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={prevHref}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              safePage <= 1
                ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400 opacity-50"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Link>

          {visiblePages.map((pageNo) => {
            const active = pageNo === safePage;
            return (
              <Link
                key={pageNo}
                href={createHrefFromQuery(qs, { page: pageNo })}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNo}
              </Link>
            );
          })}

          <Link
            href={nextHref}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              safePage >= safeTotalPages
                ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400 opacity-50"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MarketplaceEmptyState({ filtered }) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
        {filtered ? <Search className="h-8 w-8" /> : <Store className="h-8 w-8" />}
      </div>

      <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
        {filtered ? "Filtrene uygun ürün bulunamadı" : "Henüz yayınlanan ürün yok"}
      </h3>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
        {filtered
          ? "Arama kelimesini sadeleştir, fiyat aralığını genişlet veya kategori filtresini kaldırarak tekrar deneyebilirsin."
          : "Pazaryerinde yayınlanan ürünler burada listelenir. İşletmeler ürün ekranından ilgili seçeneği açtığında vitrinde görünmeye başlar."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {filtered ? (
          <Link
            href="/business/civardaki-magaza"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Filtreleri temizle
          </Link>
        ) : (
          <Link
            href="/business/products"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Ürünlere git
          </Link>
        )}
      </div>
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="h-24 animate-pulse bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      <div className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

function CivardakiMagazaContent() {
  const sp = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [error, setError] = useState(null);

  const qs = useMemo(() => buildQueryFromSearchParams(sp), [sp]);
  const filtered = useMemo(() => hasAnyActiveFilter(sp), [sp]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/public/marketplace/products${qs ? `?${qs}` : ""}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setItems([]);
          setPagination(DEFAULT_PAGINATION);
          setError(data?.message || "Ürünler yüklenirken bir hata oluştu.");
          return;
        }

        setItems(Array.isArray(data?.items) ? data.items : []);
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
        setPagination(data?.pagination || DEFAULT_PAGINATION);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setItems([]);
        setPagination(DEFAULT_PAGINATION);
        setError("Bağlantı kurulamadı. Lütfen tekrar deneyin.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [qs]);

  const total = Number(pagination?.total || 0);
  const pageNum = Math.max(1, Number(pagination?.page || 1));
  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
  const pageSize = Number(pagination?.pageSize || 24);

  const firstItem = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const lastItem = Math.min(total, pageNum * pageSize);

  const activeCategoryName = useMemo(() => {
    const categoryId = sp.get("categoryId");
    if (!categoryId) return "Tüm Kategoriler";
    return (
      categories.find((item) => String(item.id) === String(categoryId))?.name ||
      "Seçili Kategori"
    );
  }, [categories, sp]);

  if (loading) {
    return (
      <div
        className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10"
        style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
      >
        <MarketplaceSkeleton />
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10"
      style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
    >
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <Sparkles className="h-4 w-4" />
                Dijital Vitrin
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Civardaki Mağaza
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                İşletmelerin pazaryerinde yayınladığı ürünleri modern bir vitrin
                yapısında keşfet, filtrele ve karşılaştır.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/business/products"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Ürünlere Git
              </Link>

              <Link
                href="/business/civardaki-magaza"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
                Yenile
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Ürün"
            value={total}
            sub="Listeye giren tüm kayıtlar"
            icon={PackageCheck}
            tone="blue"
          />
          <StatCard
            title="Kategori"
            value={activeCategoryName}
            sub="Seçili görünüm"
            icon={Filter}
            tone="emerald"
          />
          <StatCard
            title="Gösterilen Aralık"
            value={`${firstItem}-${lastItem}`}
            sub="Mevcut sayfadaki sonuçlar"
            icon={LayoutGrid}
            tone="amber"
          />
          <StatCard
            title="Liste Durumu"
            value={filtered ? "Filtreli" : "Tümü"}
            sub="Aktif filtre görünümü"
            icon={Store}
            tone="slate"
          />
        </div>
      </section>

      <SectionCard
        title="Filtreler"
        subtitle="Arama, kategori, fiyat ve stok filtrelerini yönetin"
        right={
          filtered ? (
            <Link
              href="/business/civardaki-magaza"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Filtreleri Temizle
            </Link>
          ) : null
        }
      >
        <CivardakiMagazaFilters categories={categories} />
      </SectionCard>

      <SectionCard
        title="Liste Özeti"
        subtitle="Seçili filtrelere göre oluşan sonuç görünümü"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {total} ürün bulundu
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {filtered
                ? "Filtrelenmiş sonuçlar gösteriliyor."
                : "Pazaryerinde yayınlanan tüm aktif ürünler listeleniyor."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            {sp.get("q") ? (
              <span className="rounded-full bg-slate-100 px-3 py-1.5">
                Arama: {sp.get("q")}
              </span>
            ) : null}

            {sp.get("inStockOnly") === "true" ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                Sadece stoktakiler
              </span>
            ) : null}

            {sp.get("min") || sp.get("max") ? (
              <span className="rounded-full bg-slate-100 px-3 py-1.5">
                Fiyat: {sp.get("min") || "0"} - {sp.get("max") || "∞"}
              </span>
            ) : null}

            {sp.get("sort") ? (
              <span className="rounded-full bg-slate-100 px-3 py-1.5">
                Sıralama: {sp.get("sort")}
              </span>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-rose-900">Bir sorun oluştu</p>
              <p className="mt-1 text-sm text-rose-800">{error}</p>
            </div>

            <Link
              href={createHrefFromQuery(qs)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
            >
              Tekrar Dene
            </Link>
          </div>
        </div>
      ) : null}

      {!error && items.length === 0 ? (
        <MarketplaceEmptyState filtered={filtered} />
      ) : (
        <SectionCard
          title="Ürün Vitrini"
          subtitle="Pazaryerinde yayınlanan ürün kartları"
        >
          <CivardakiMagazaGrid items={items} loading={false} />
        </SectionCard>
      )}

      {!error && items.length > 0 ? (
        <Pagination qs={qs} page={pageNum} totalPages={totalPages} />
      ) : null}
    </div>
  );
}

export default function CivardakiMagazaPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
          <MarketplaceSkeleton />
        </div>
      }
    >
      <CivardakiMagazaContent />
    </Suspense>
  );
}