"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function pageRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
        result.push(sorted[i]);
    }
    return result;
}

export default function CategoryPagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = pageRange(page, totalPages);

    return (
        <nav
            className="mt-10 flex items-center justify-center gap-1"
            aria-label="Sayfalama"
        >
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#0057d9] hover:text-[#0057d9] disabled:opacity-40"
                aria-label="Önceki sayfa"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {pages.map((p, idx) =>
                p === "…" ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-sm font-bold text-slate-400"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-black transition ${
                            p === page
                                ? "bg-[#0057d9] text-white shadow-md"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-[#0057d9] hover:text-[#0057d9]"
                        }`}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#0057d9] hover:text-[#0057d9] disabled:opacity-40"
                aria-label="Sonraki sayfa"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </nav>
    );
}
