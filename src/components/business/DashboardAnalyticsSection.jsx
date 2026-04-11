"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Phone,
  Eye,
  Target,
  ChevronRight,
} from "lucide-react";

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    rose: "from-rose-500 to-pink-700 text-white",
    purple: "from-purple-500 to-violet-700 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.12)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FilterTabs({ timeRange, setTimeRange }) {
  const ranges = ["gün", "hafta", "ay", "yıl"];

  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => setTimeRange(range)}
          className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
            timeRange === range
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

export default function DashboardAnalyticsSection() {
  const [timeRange, setTimeRange] = useState("hafta");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/business/analytics?range=${timeRange}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && !json.error) setData(json);
        else if (!cancelled) setData(null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const summary = {
    views: data?.kpis?.views ?? 0,
    directions: data?.kpis?.directions ?? 0,
    calls: data?.kpis?.calls ?? 0,
    revenue: `${(data?.kpis?.revenue ?? 0).toLocaleString("tr-TR")} ₺`,
    conversion: `%${data?.kpis?.conversionRate ?? 0}`,
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
            <BarChart3 className="h-4 w-4 shrink-0" />
            Etkileşim özeti
          </div>
          <p className="text-sm text-slate-300">
            Profil, yol tarifi, arama ve dönüşüm — analitik sayfasıyla aynı veri.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs timeRange={timeRange} setTimeRange={setTimeRange} />
          <Link
            href="/business/analytics"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
          >
            Detaylı analitik
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[120px] animate-pulse rounded-[24px] bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Profil Görüntülenme"
              value={summary.views}
              sub="Toplam profil gösterimi"
              icon={Eye}
              tone="blue"
            />
            <StatCard
              title="Yol Tarifi"
              value={summary.directions}
              sub="Harita etkileşimleri"
              icon={MapPin}
              tone="emerald"
            />
            <StatCard
              title="Telefon Araması"
              value={summary.calls}
              sub="Ara butonu tıklamaları"
              icon={Phone}
              tone="rose"
            />
            <StatCard
              title="Gelir"
              value={summary.revenue}
              sub="Seçili dönem toplamı"
              icon={TrendingUp}
              tone="purple"
            />
            <StatCard
              title="Dönüşüm"
              value={summary.conversion}
              sub="Ziyaret → talep oranı"
              icon={Target}
              tone="slate"
            />
          </div>
        )}
      </div>
    </section>
  );
}
