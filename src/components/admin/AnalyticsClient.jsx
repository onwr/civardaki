"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Target,
  MapPin,
  Layers,
  Briefcase,
  Activity,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrencyTR, formatPercent } from "@/lib/analytics/formatters";
import { getTrendMeta } from "@/lib/analytics/trend-utils";
import { getPlanPrice } from "@/lib/analytics/subscription-config";

const COLORS = ["#004aad", "#3b82f6", "#64748b", "#94a3b8", "#cbd5e1"];
const TREND_ICONS = { ArrowUpRight, ArrowDownRight, Minus };

const LEAD_STATUS_LABELS = {
  NEW: "Yeni",
  CONTACTED: "İletişimde",
  QUOTED: "Teklif Verildi",
  REPLIED: "Yanıtlandı",
  CLOSED: "Kazanılan",
  LOST: "Kayıp",
};

function ChartEmpty() {
  return (
    <div className="flex items-center justify-center h-full min-h-[280px] text-slate-400 text-sm font-medium">
      Veri bulunamadı
    </div>
  );
}

export default function AnalyticsClient() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
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
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-8 pb-20">
        <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="h-12 w-12 bg-slate-100 rounded-xl animate-pulse mb-4" />
              <div className="h-8 w-20 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-slate-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-[400px] bg-slate-50 rounded-2xl animate-pulse" />
          <div className="lg:col-span-4 h-[300px] bg-slate-50 rounded-2xl animate-pulse" />
        </div>
        <p className="text-slate-500 text-sm text-center">Analitik veriler hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <p className="text-slate-600 font-medium text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={fetchAnalytics}
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

  const totalLeads = stats?.totalLeads ?? 0;
  const categories = stats?.categoryPerformance ?? stats?.categories ?? [];
  const cities = stats?.cityDistribution ?? stats?.cities ?? [];
  const statuses = stats?.statuses ?? [];
  const subscriptions = stats?.subscriptions ?? [];
  const leadTrend = stats?.leadTrend ?? [];
  const businessTrend = stats?.businessTrend ?? [];
  const revenueTrend = stats?.revenueTrend ?? [];

  const trendCombined = leadTrend.map((d, i) => ({
    name: d.name,
    date: d.date,
    leads: d.leads ?? 0,
    businesses: businessTrend[i]?.businesses ?? 0,
    revenue: revenueTrend[i]?.revenue ?? 0,
  }));
  const hasTrendData = trendCombined.some((d) => d.leads > 0 || d.businesses > 0 || d.revenue > 0);

  const kpiCards = [
    {
      label: "Toplam Lead",
      value: totalLeads,
      trend: stats?.leadGrowthRate,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Aktif İşletme",
      value: stats?.totalBusinesses ?? 0,
      trend: stats?.businessGrowthRate,
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Aktif Abonelik",
      value: stats?.activeSubscriptions ?? 0,
      trend: stats?.subscriptionGrowthRate,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Dönüşüm Oranı",
      value: formatPercent(stats?.conversionRate ?? 0),
      trend: null,
      icon: ShieldCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Tahmini MRR",
      value: formatCurrencyTR(stats?.estimatedMRR ?? 0),
      trend: null,
      icon: DollarSign,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Sistem canlılık verileri
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
            İşletme & Lead Analitiği
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiCards.map((card, i) => {
          const trendMeta = card.trend != null ? getTrendMeta(card.trend) : null;
          const TrendIcon = trendMeta?.iconName ? TREND_ICONS[trendMeta.iconName] : null;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {trendMeta && TrendIcon && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendMeta.colorClass}`}>
                    <TrendIcon className="w-3.5 h-3.5" /> {trendMeta.label}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-950 tabular-nums truncate">
                  {card.value}
                </p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Kategori dağılımı</h3>
              <p className="text-xs text-slate-500">Lead sayısına göre (en çok 5)</p>
            </div>
          </div>
          {categories.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories.slice(0, 5)}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    formatter={(value) => [value, "Lead"]}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Bar dataKey="count" fill="#004aad" radius={[0, 8, 8, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Şehir yoğunluğu</h3>
              <p className="text-xs text-slate-500">Lead sayısına göre</p>
            </div>
          </div>
          {cities.length === 0 ? (
            <ChartEmpty />
          ) : (
            <>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cities.slice(0, 5)}
                      innerRadius={56}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="name"
                    >
                      {cities.slice(0, 5).map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Lead"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {cities.slice(0, 4).map((city, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {city.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 tabular-nums">
                      {city.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {hasTrendData && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Son 7 gün trendi</h3>
              <p className="text-xs text-slate-500">Günlük lead ve işletme sayıları</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendCombined} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [value]}
                  labelFormatter={(label) => `Tarih: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  name="Lead"
                  stroke="#004aad"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="businesses"
                  name="İşletme"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Abonelik hacmi</h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                Aktif plan dağılımı
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          {subscriptions.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub, i) => {
                const price = getPlanPrice(sub.plan);
                const total = (sub.count ?? 0) * price;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-8 rounded-full ${sub.plan === "PREMIUM" ? "bg-amber-400" : "bg-blue-400"}`}
                      />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-white">
                          {sub.plan}
                        </p>
                        <p className="text-xs text-white/60">Aktif {sub.count ?? 0} işletme</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold tabular-nums">
                        {formatCurrencyTR(total)}
                      </p>
                      <p className="text-[10px] text-emerald-400/90 uppercase tracking-wider">
                        Aylık
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Lead durumları</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                Duruma göre dağılım
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          {statuses.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="space-y-5">
              {statuses.map((s, i) => {
                const pct = totalLeads > 0 ? (s.count / totalLeads) * 100 : 0;
                const label = LEAD_STATUS_LABELS[s.status] ?? s.status;
                const barColor =
                  s.status === "CLOSED"
                    ? "bg-emerald-500"
                    : s.status === "NEW"
                      ? "bg-blue-600"
                      : "bg-slate-400";
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span className="uppercase tracking-wide">{label}</span>
                      <span className="tabular-nums text-slate-900">{s.count} adet</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
