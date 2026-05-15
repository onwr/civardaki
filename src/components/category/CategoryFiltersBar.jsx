"use client";

import { Search, X } from "lucide-react";
import { turkeyLocations, getDistricts } from "@/constants/locations";

export default function CategoryFiltersBar({
    categoryName,
    q,
    onQChange,
    city,
    onCityChange,
    district,
    onDistrictChange,
    sort,
    onSortChange,
    onApply,
}) {
    const districts = city ? getDistricts(city) : [];

    return (
        <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm md:p-6">
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    value={q}
                    onChange={(e) => onQChange(e.target.value)}
                    placeholder={`${categoryName} adı veya açıklamada ara...`}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 text-base font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                {q && (
                    <button
                        type="button"
                        onClick={() => onQChange("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
                <div className="md:col-span-3">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                        Şehir
                    </label>
                    <select
                        value={city}
                        onChange={(e) => onCityChange(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10"
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
                        onChange={(e) => onDistrictChange(e.target.value)}
                        disabled={!city}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                    >
                        <option value="">{city ? "Tümü" : "Önce şehir seç"}</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-4">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                        Sırala
                    </label>
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                        <option value="nearby">En Yakın</option>
                        <option value="popular">Popüler</option>
                        <option value="newest">En Yeni</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <button
                        type="button"
                        onClick={onApply}
                        className="w-full rounded-2xl bg-[#0057d9] px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#004cc2] md:h-[50px]"
                    >
                        Filtrele
                    </button>
                </div>
            </div>
        </div>
    );
}
