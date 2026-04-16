"use client";

import { CreditCard, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * @param {{ status: string, plan: string, expiresAt: string | Date } | null | undefined} subscription
 * @param {"card" | "compact"} [variant]
 */
export default function DashboardSubscriptionWidget({ subscription, variant = "card" }) {
    if (!subscription) return null;

    const { status, expiresAt } = subscription;
    const isExpired = status === "EXPIRED" || new Date(expiresAt) < new Date();
    const daysLeft = Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));

    if (variant === "compact") {
        return (
            <Link
                href="/business/billing"
                className={`group flex max-w-[min(100%,240px)] shrink-0 flex-col rounded-xl border px-2 py-1.5 text-left transition sm:max-w-[280px] sm:flex-row sm:items-center sm:gap-2 sm:px-3 sm:py-2 ${
                    isExpired
                        ? "border-rose-200 bg-rose-50/90 hover:bg-rose-50"
                        : status === "TRIAL"
                          ? "border-amber-200 bg-amber-50/90 hover:bg-amber-50"
                          : "border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-50"
                }`}
                title="Panel aboneliği — faturalandırma"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isExpired
                                ? "bg-rose-100 text-rose-600"
                                : status === "TRIAL"
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 leading-none">
                            Panel aboneliği
                        </p>
                        {isExpired ? (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-rose-600">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                Süre doldu
                            </p>
                        ) : (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-700">
                                <CheckCircle className="h-3 w-3 shrink-0 text-emerald-600" />
                                <span className="tabular-nums">Kalan {daysLeft} gün</span>
                            </p>
                        )}
                    </div>
                </div>
                <span
                    className={`mt-1 inline-flex shrink-0 items-center self-start rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider md:mt-0 md:self-center ${
                        isExpired
                            ? "bg-rose-100 text-rose-700"
                            : status === "TRIAL"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                    }`}
                >
                    {isExpired ? "Doldu" : status === "TRIAL" ? "Deneme" : "Aktif"}
                </span>
                <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 md:block" aria-hidden />
            </Link>
        );
    }

    return (
        <div className="h-full bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 p-5 flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isExpired ? "bg-rose-100 text-rose-500" : status === "TRIAL" ? "bg-amber-100 text-amber-500" : "bg-blue-100 text-blue-500"}`}>
                    <CreditCard className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full shrink-0 ${isExpired ? "bg-rose-100 text-rose-600" : status === "TRIAL" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {isExpired ? "SÜRE DOLDU" : status === "TRIAL" ? "DENEME" : "AKTİF"}
                </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1">Panel Aboneliği</h3>
            {isExpired ? (
                <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Erişim kısıtlandı
                </p>
            ) : (
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Kalan: <span className="text-slate-900 font-bold">{daysLeft} gün</span>
                </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-200/80">
                <Link
                    href="/business/billing"
                    className="w-full inline-flex items-center justify-center py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                    Aboneliği Yönet
                </Link>
            </div>
        </div>
    );
}
