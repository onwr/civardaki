"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight, AlertTriangle } from "lucide-react";

/**
 * CompletionBanner — shows at the top of the dashboard when completion < threshold.
 * Fetches from /api/business/onboarding. Self-dismissable per session.
 */
export default function CompletionBanner() {
    const [data, setData] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const isDismissed = sessionStorage.getItem("completion_banner_dismissed");
        if (isDismissed) { setDismissed(true); return; }

        fetch("/api/business/onboarding")
            .then(r => r.ok ? r.json() : null)
            .then(json => { if (json) setData(json); })
            .catch(() => { });
    }, []);

    const dismiss = () => {
        sessionStorage.setItem("completion_banner_dismissed", "1");
        setDismissed(true);
    };

    const pct = data?.completionPercent;
    const missing = data?.missingSteps || [];

    // Only show when below 80
    if (dismissed || pct === undefined || pct >= 80) return null;

    const isLow = pct < 30;
    const isMedium = pct >= 30 && pct < 60;

    return (
        <div className={`relative rounded-3xl border p-6 mb-8 ${isLow
                ? "bg-rose-50 border-rose-200"
                : isMedium
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
            }`}>
            <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Kapat"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icon + text */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isLow ? "bg-rose-100 text-rose-600" : isMedium ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    }`}>
                    {isLow ? <AlertTriangle className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${isLow ? "text-rose-800" : isMedium ? "text-amber-800" : "text-blue-800"}`}>
                        {isLow
                            ? `⚠️ Profiliniz %${pct} tamamlandı — Lead dönüşümü düşük!`
                            : `Profiliniz %${pct} tamamlandı — daha fazla lead kazanmak için:`
                        }
                    </p>
                    {missing.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {missing.slice(0, 3).map(m => (
                                <Link
                                    key={m.id}
                                    href={m.linkUrl}
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLow
                                            ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                            : isMedium
                                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        }`}
                                >
                                    {m.title} <ChevronRight className="w-3 h-3" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress + CTA */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                        <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5"
                                    className={isLow ? "stroke-rose-200" : isMedium ? "stroke-amber-200" : "stroke-blue-200"} />
                                <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5"
                                    strokeDasharray={`${(pct / 100) * 169.6} 169.6`}
                                    className={isLow ? "stroke-rose-500" : isMedium ? "stroke-amber-500" : "stroke-blue-500"}
                                    strokeLinecap="round" />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${isLow ? "text-rose-700" : isMedium ? "text-amber-700" : "text-blue-700"}`}>
                                %{pct}
                            </span>
                        </div>
                    </div>
                    <Link
                        href="/business/onboarding"
                        className={`px-5 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${isLow ? "bg-rose-600 hover:bg-rose-700" : isMedium ? "bg-amber-600 hover:bg-amber-700" : "bg-[#004aad] hover:bg-blue-700"
                            }`}
                    >
                        Profili Tamamla
                    </Link>
                </div>
            </div>
        </div>
    );
}
