"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, MapPin } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import CategoryFiltersBar from "@/components/category/CategoryFiltersBar";
import CategoryListingCard from "@/components/category/CategoryListingCard";
import CategoryPagination from "@/components/category/CategoryPagination";

function toQS(obj) {
    const sp = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v !== null && v !== undefined && String(v).trim() !== "") {
            sp.set(k, String(v).trim());
        }
    });
    return sp.toString();
}

function ExplorerSkeleton() {
    return (
        <section className="mx-auto container px-4 sm:px-6 py-8">
            <div className="h-48 animate-pulse rounded-[28px] bg-white border border-slate-100" />
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-80 animate-pulse rounded-[26px] bg-white border border-slate-100"
                    />
                ))}
            </div>
        </section>
    );
}

function CategoryBusinessExplorerInner({
    categorySlug,
    categoryName,
    totalBusinessCount = 0,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedLocation, isHydrated } = useLocation();
    const filtersRef = useRef(null);
    const filterKeyRef = useRef("");

    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [city, setCity] = useState(searchParams.get("city") ?? "");
    const [district, setDistrict] = useState(searchParams.get("district") ?? "");
    const [sort, setSort] = useState(searchParams.get("sort") ?? "nearby");
    const [page, setPage] = useState(
        Math.max(1, parseInt(searchParams.get("page") || "1", 10)),
    );
    const [viewMode, setViewMode] = useState("grid");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [locationSynced, setLocationSynced] = useState(false);

    const limit = 12;
    const filterKey = `${q}|${city}|${district}|${sort}`;

    useEffect(() => {
        if (!isHydrated || locationSynced) return;
        if (!city && selectedLocation?.cityName) {
            setCity(selectedLocation.cityName);
        }
        if (!district && selectedLocation?.districtName) {
            setDistrict(selectedLocation.districtName);
        }
        setLocationSynced(true);
    }, [isHydrated, selectedLocation, city, district, locationSynced]);

    useEffect(() => {
        if (filterKeyRef.current && filterKeyRef.current !== filterKey) {
            setPage(1);
        }
        filterKeyRef.current = filterKey;
    }, [filterKey]);

    const syncUrl = useCallback(
        (nextPage) => {
            const qs = toQS({
                q,
                city,
                district,
                sort,
                page: nextPage > 1 ? nextPage : "",
            });
            const path = qs
                ? `/kategori/${categorySlug}?${qs}`
                : `/kategori/${categorySlug}`;
            router.replace(path, { scroll: false });
        },
        [q, city, district, sort, categorySlug, router],
    );

    const fetchBusinesses = useCallback(
        async (targetPage) => {
            setLoading(true);
            try {
                const params = {
                    q,
                    city,
                    district,
                    category: categorySlug,
                    sort,
                    page: targetPage,
                    limit,
                };
                if (selectedLocation?.lat != null && selectedLocation?.lng != null) {
                    params.lat = selectedLocation.lat;
                    params.lng = selectedLocation.lng;
                }
                const qs = toQS(params);
                const res = await fetch(`/api/public/businesses?${qs}`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    setItems([]);
                    setTotal(0);
                    setTotalPages(1);
                    return;
                }
                const data = await res.json();
                setItems(data.items || []);
                setTotal(data.pagination?.total ?? 0);
                setTotalPages(data.pagination?.totalPages ?? 1);
            } catch {
                setItems([]);
                setTotal(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [
            q,
            city,
            district,
            categorySlug,
            sort,
            selectedLocation?.lat,
            selectedLocation?.lng,
        ],
    );

    useEffect(() => {
        if (!isHydrated) return;
        const t = setTimeout(() => {
            fetchBusinesses(page);
            syncUrl(page);
        }, 300);
        return () => clearTimeout(t);
    }, [
        q,
        city,
        district,
        sort,
        page,
        isHydrated,
        selectedLocation?.lat,
        selectedLocation?.lng,
        fetchBusinesses,
        syncUrl,
    ]);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const res = await fetch("/api/user/favorites", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                const ids = new Set(
                    (Array.isArray(data) ? data : []).map((f) => f.businessId),
                );
                setFavoriteIds(ids);
            } catch {
                /* ignore */
            }
        };
        loadFavorites();
    }, []);

    const handleApplyFilters = () => {
        setPage(1);
    };

    const handlePageChange = (nextPage) => {
        setPage(nextPage);
        filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleFavoriteToggle = async (business) => {
        const isFav = favoriteIds.has(business.id);
        try {
            if (isFav) {
                const res = await fetch("/api/user/favorites", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ businessId: business.id }),
                });
                if (res.ok) {
                    setFavoriteIds((prev) => {
                        const next = new Set(prev);
                        next.delete(business.id);
                        return next;
                    });
                }
            } else {
                const res = await fetch("/api/user/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ businessId: business.id }),
                });
                if (res.ok) {
                    setFavoriteIds((prev) => new Set(prev).add(business.id));
                }
            }
        } catch {
            /* ignore */
        }
    };

    const mapHref = useMemo(() => {
        const qs = toQS({ category: categorySlug, city, district, q });
        return qs ? `/search?${qs}` : `/search?category=${categorySlug}`;
    }, [categorySlug, city, district, q]);

    const resultCount = total > 0 ? total : totalBusinessCount;

    return (
        <section className="mx-auto container px-4 sm:px-6 py-8" ref={filtersRef}>
            <CategoryFiltersBar
                categoryName={categoryName}
                q={q}
                onQChange={setQ}
                city={city}
                onCityChange={(v) => {
                    setCity(v);
                    setDistrict("");
                }}
                district={district}
                onDistrictChange={setDistrict}
                sort={sort}
                onSortChange={setSort}
                onApply={handleApplyFilters}
            />

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-600">
                    <span className="font-black text-slate-900">{resultCount}+</span> işletme
                    bulundu
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={mapHref}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#0057d9] transition hover:bg-blue-50"
                    >
                        <MapPin className="h-4 w-4" />
                        Haritada Gör
                    </Link>
                    <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                viewMode === "grid"
                                    ? "bg-[#0057d9] text-white"
                                    : "text-slate-500 hover:bg-slate-50"
                            }`}
                            aria-label="Izgara görünümü"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                viewMode === "list"
                                    ? "bg-[#0057d9] text-white"
                                    : "text-slate-500 hover:bg-slate-50"
                            }`}
                            aria-label="Liste görünümü"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div
                        className={`grid gap-6 ${
                            viewMode === "grid"
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1"
                        }`}
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-80 animate-pulse rounded-[26px] bg-white border border-slate-100"
                            />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-100 bg-white px-6 py-16 text-center">
                        <p className="text-xl font-black text-slate-900">Sonuç bulunamadı</p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Filtreleri genişletmeyi deneyin.
                        </p>
                    </div>
                ) : (
                    <>
                        <div
                            className={`grid gap-6 ${
                                viewMode === "grid"
                                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1"
                            }`}
                        >
                            {items.map((b, i) => (
                                <CategoryListingCard
                                    key={b.id}
                                    business={b}
                                    index={i}
                                    viewMode={viewMode}
                                    isFavorite={favoriteIds.has(b.id)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                            ))}
                        </div>
                        <CategoryPagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default function CategoryBusinessExplorer(props) {
    return (
        <Suspense fallback={<ExplorerSkeleton />}>
            <CategoryBusinessExplorerInner {...props} />
        </Suspense>
    );
}
