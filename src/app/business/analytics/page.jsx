"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Phone,
  Eye,
  Globe,
  Clock,
  Target,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

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
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
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
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FilterTabs({ timeRange, setTimeRange }) {
  const ranges = ["gün", "hafta", "ay", "yıl"];

  return (
    <div className="flex flex-wrap gap-3">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => setTimeRange(range)}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("hafta");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/business/analytics?range=${timeRange}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = {
    views: data?.kpis?.views || 0,
    directions: data?.kpis?.directions || 0,
    calls: data?.kpis?.calls || 0,
    revenue: `${(data?.kpis?.revenue || 0).toLocaleString()} ₺`,
    conversion: `%${data?.kpis?.conversionRate ?? 0}`,
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <BarChart3 className="h-4 w-4" />
                  Etkileşim Analitiği
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  İşletme Performans Merkezi
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Profil görüntülenmeleri, yol tarifi, telefon aramaları ve dönüşüm
                  metriklerini tek ekranda izleyin.
                </p>
              </div>

              <FilterTabs timeRange={timeRange} setTimeRange={setTimeRange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-5">
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
        </section>

        <SectionCard
          title="Etkileşim Trendi"
          subtitle="Görüntülenme ve yol tarifi performansı"
        >
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.interactionData || []}>
                  <defs>
                    <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="directionsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#viewsFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="directions"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#directionsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Trafik Kaynakları"
            subtitle="Müşterilerin sizi bulduğu kanallar"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.sourceData || []}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(data?.sourceData || []).map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {(data?.sourceData || []).map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {source.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      %{source.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Yoğun Saatler"
            subtitle="Günün en çok etkileşim alan zamanları"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.timeHeatmap || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {(data?.timeHeatmap || []).map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.value > 8 ? "#f59e0b" : "#fcd34d"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800">
              Etkileşim yoğunluğu genelde <strong>20:00 - 22:00</strong> arasında
              artıyor. Bu saatlerde kampanya ve bildirim planlaması daha verimli olabilir.
            </div>
          </SectionCard>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <Star className="h-4 w-4" />
                Yapay Zeka Önerisi
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Dönüşüm oranı şu an {summary.conversion}
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-100/85">
                Profil ziyareti ile talep oluşturma arasındaki oranı iyileştirmek için
                yoğun saatlerde görünür aksiyonlar ve teklif odaklı kampanyalar öne çıkarılabilir.
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}