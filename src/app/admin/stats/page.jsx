"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Globe,
  Download,
  Calendar,
  RefreshCw,
  Users,
  Briefcase,
  Zap,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrencyTR, formatPercent } from "@/lib/analytics/formatters";
import { getTrendMeta } from "@/lib/analytics/trend-utils";
import { exportStatsToCsv } from "@/lib/admin-stats/csv";

const COLORS = ["#004aad", "#10b981", "#6366f1", "#f59e0b", "#ef4444"];
const RANGE_OPTIONS = [
  { value: "7d", label: "7 GÜN" },
  { value: "30d", label: "30 GÜN" },
  { value: "1y", label: "1 YIL" },
];

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async (range) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?range=${range}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.stats) {
        setStats(data.stats);
        setError(null);
      } else {
        setError(data?.error || "Veriler alınamadı.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(selectedRange);
  }, [selectedRange, fetchStats]);

  const handleRangeChange = (value) => {
    setSelectedRange(value);
    fetchStats(value);
  };

  const handleExport = () => {
    if (!stats) return;
    setExporting(true);
    try {
      exportStatsToCsv(stats, selectedRange);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-12">
        <div className="h-24 w-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-[450px] bg-slate-50 rounded-2xl animate-pulse" />
        <p className="text-center text-slate-500 text-sm">Veriler yükleniyor...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <p className="text-slate-600 font-medium text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => fetchStats(selectedRange)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        Veri yok. Lütfen tekrar deneyin.
      </div>
    );
  }

  const summary = stats.summary || {};
  const growthSeries = stats.growthSeries || [];
  const categoryDistribution = stats.categoryDistribution || [];
  const systemHealth = stats.systemHealth || {};
  const hasGrowthData = growthSeries.some(
    (d) => (d.users || 0) > 0 || (d.business || 0) > 0
  );

  const kpiItems = [
    {
      label: "Toplam Kullanıcı",
      value: summary.totalUsers ?? 0,
      trend: summary.userGrowthRate,
      icon: Users,
    },
    {
      label: "Toplam İşletme",
      value: summary.totalBusinesses ?? 0,
      trend: summary.businessGrowthRate,
      icon: Briefcase,
    },
    {
      label: "Aktif Abonelik",
      value: summary.activeSubscriptions ?? 0,
      trend: summary.subscriptionGrowthRate,
      icon: Zap,
    },
    {
      label: "Toplam Gelir",
      value: formatCurrencyTR(summary.totalRevenue),
      trend: summary.revenueGrowthRate,
      icon: DollarSign,
    },
  ];

  const healthCards = [
    {
      label: "SERVER UPTIME",
      value: `${systemHealth.uptimePercent ?? 99.99}%`,
      icon: Globe,
      status: "Stabil",
    },
    {
      label: "API LATENCY",
      value: `${systemHealth.apiLatencyMs ?? 0}ms`,
      icon: Activity,
      status: "Hızlı",
    },
    {
      label: "CONSECUTIVE DAYS",
      value: `${systemHealth.consecutiveDays ?? 0} GÜN`,
      icon: Calendar,
      status: "Kesintisiz",
    },
  ];

  return (
    <div className="space-y-12">
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#004aad]">
              Global Platform Analitiği
            </span>
          </div>
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none uppercase">
              BÜYÜME <br /> <span className="text-[#004aad]">GRAFİKLERİ</span>
            </h1>
            <p className="text-slate-400 font-semibold text-base lg:text-lg mt-4 max-w-2xl">
              Platform genelindeki büyüme verilerini, finansal metrikleri ve kullanıcı kazanım oranlarını inceleyin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRangeChange(opt.value)}
                disabled={loading}
                className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedRange === opt.value
                    ? "bg-[#004aad] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={!stats || exporting}
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
          >
            <Download className="w-5 h-5" /> {exporting ? "İndiriliyor…" : "VERİLERİ İNDİR"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((kpi, i) => {
          const trendMeta =
            kpi.trend != null ? getTrendMeta(kpi.trend) : null;
          return (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#004aad]">
                  <kpi.icon className="w-6 h-6" />
                </div>
                {trendMeta && (
                  <span
                    className={`text-xs font-semibold ${
                      trendMeta.colorClass || "text-slate-500"
                    }`}
                  >
                    {trendMeta.label}
                  </span>
                )}
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950 tabular-nums truncate">
                {kpi.value}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">
                Platform büyüme hacmi
              </h2>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
                Kullanıcı kayıt & işletme onboarding
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#004aad]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Kullanıcı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">İşletme</span>
              </div>
            </div>
          </div>

          {!hasGrowthData ? (
            <div className="flex items-center justify-center h-[400px] text-slate-400 text-sm">
              Bu aralık için veri bulunamadı
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthSeries}>
                  <defs>
                    <linearGradient id="statsColorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004aad" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#004aad" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="statsColorBiz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 12,
                    }}
                    formatter={(value) => [value]}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#004aad"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#statsColorUsers)"
                  />
                  <Area
                    type="monotone"
                    dataKey="business"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#statsColorBiz)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight mb-6">
            Kategori dağılımı
          </h2>
          {categoryDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
              Veri bulunamadı
            </div>
          ) : (
            <>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {categoryDistribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {categoryDistribution.slice(0, 6).map((cat, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-xs font-semibold text-slate-600 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      %{Number(cat.percent ?? 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {healthCards.map((card, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-8 flex items-center justify-between shadow-sm hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-[#004aad]">
                  <card.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <h4 className="text-2xl font-bold text-slate-950 tabular-nums">
                    {card.value}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                {card.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
