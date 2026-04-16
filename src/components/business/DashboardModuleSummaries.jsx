"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { getNavigationWithPreferences } from "@/lib/business-navigation-menu";
import { BusinessTypes } from "@/lib/navigation-config";
import { navItemPrefId } from "@/lib/dashboard-nav-modules";

/**
 * @param {{ prefId: string, title: string, href: string, stats: { label: string, value: string }[] }[]} navModules
 * @param {string} [businessType] Prisma `business.type` ("INDIVIDUAL" | "CORPORATE")
 */
export default function DashboardModuleSummaries({ navModules = [], businessType }) {
  const orderedModules = useMemo(() => {
    if (!Array.isArray(navModules) || navModules.length === 0) return [];
    const bt =
      businessType === "CORPORATE" ? BusinessTypes.CORPORATE : BusinessTypes.INDIVIDUAL;
    const visibleNav = getNavigationWithPreferences(bt);
    const orderIds = visibleNav.map((v) => v._prefId || navItemPrefId(v)).filter(Boolean);
    return orderIds
      .map((id) => navModules.find((m) => m.prefId === id))
      .filter(Boolean);
  }, [navModules, businessType]);

  if (!orderedModules.length) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Modül özetleri</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Sol menüdeki bölümler — hızlı metrikler
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Menüde gizlediğiniz modüller burada da görünmez. İş planlama, talepler, siparişler ve diğer araçlar için özet
          sayılar API üzerinden gelir; satış ve alış tutarları sipariş / alış belgeleri üzerinden hesaplanır.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {orderedModules.map((mod) => (
          <Link
            key={mod.prefId}
            href={mod.href}
            className="group flex flex-col rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <LayoutGrid className="h-4 w-4" />
                </span>
                <h3 className="truncate text-sm font-bold text-slate-900">{mod.title}</h3>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {mod.stats.map((row) => (
                <div
                  key={`${mod.prefId}-${row.label}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{row.label}</dt>
                  <dd className="mt-1 text-sm font-bold tabular-nums text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <span className="mt-4 text-xs font-semibold text-blue-700 group-hover:underline">Modüle git</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
