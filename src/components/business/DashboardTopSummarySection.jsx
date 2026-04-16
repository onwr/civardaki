"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, BarChart3, Gavel, ShoppingCart, Sparkles, Tag, TrendingUp, Wallet } from "lucide-react";

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const formatMoney = (value) => {
  if (value == null || Number.isNaN(value)) return "₺0,00";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatMoneyTooltip = (value) => formatMoney(Number(value) || 0);

function StatusPill({ label, tone = "default" }) {
  const tones = {
    default: "bg-white/10 text-white border-white/15",
    success: "bg-emerald-500/15 text-emerald-100 border-emerald-400/20",
    danger: "bg-rose-500/15 text-rose-100 border-rose-400/20",
    warning: "bg-amber-500/15 text-amber-100 border-amber-400/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const toneStyles = {
    blue: "from-blue-600 via-indigo-600 to-slate-900",
    emerald: "from-emerald-500 via-teal-600 to-slate-900",
    rose: "from-rose-500 via-red-600 to-slate-900",
    cyan: "from-cyan-500 via-sky-600 to-slate-900",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${toneStyles[tone]} p-5 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{title}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {subtitle ? <p className="text-xs text-white/75">{subtitle}</p> : <div />}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[24px] border border-slate-200/90 bg-white p-4 text-slate-900 shadow-sm md:p-5">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        {subtitle ? <p className="mt-1 text-sm font-semibold text-slate-800">{subtitle}</p> : null}
      </div>
      <div className="h-[240px] w-full min-h-[220px]">{children}</div>
    </div>
  );
}

export default function DashboardTopSummarySection({ business, m, isConnected, series }) {
  const now = new Date();
  const monthLabel = MONTHS_TR[now.getMonth()];
  const usd = m?.fxTryPerUsd != null ? Number(m.fxTryPerUsd).toFixed(2) : "—";
  const eur = m?.fxTryPerEur != null ? Number(m.fxTryPerEur).toFixed(2) : "—";

  const chartData =
    Array.isArray(series) && series.length > 0
      ? series
      : Array.from({ length: 7 }, (_, i) => ({
          label: `${i + 1}`,
          date: "",
          revenue: 0,
          expense: 0,
          collection: 0,
        }));

  const netWorth = (m?.assetsTotal ?? 0) - (m?.debtsTotal ?? 0);

  return (
    <div className="relative p-6 md:p-8">
      <div className="mb-6 flex w-full flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusPill label="İşletme özeti" />
            <StatusPill
              label={isConnected ? "Canlı senkron aktif" : "Canlı bağlantı yok"}
              tone={isConnected ? "success" : "warning"}
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {business?.name ? `${business.name} - İşletme Özeti` : "İşletme Özeti"}
          </h1>
          <p className="mt-2 w-full max-w-none text-sm leading-6 text-slate-300 md:text-base">
            Aylık ciro ve giderler, günlük tahsilat ve net varlık tek bakışta. Aşağıdaki grafikler son 7 günün sipariş
            cirosu, kayıtlı giderleri ve tahsilat hareketlerini gösterir.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill label={`USD/TL ${usd}`} />
            <StatusPill label={`EUR/TL ${eur}`} />
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[min(100%,320px)] lg:max-w-sm">
          <div className="flex h-full flex-col rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Hızlı durum</p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <ShoppingCart className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Bugünkü satış
                </p>
                <p className="mt-2 text-sm font-bold tabular-nums text-white">{formatMoney(m?.revenueToday ?? 0)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <Banknote className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Bugünkü tahsilat
                </p>
                <p className="mt-2 text-sm font-bold tabular-nums text-white">{formatMoney(m?.collectionToday ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={`${monthLabel} cirosu`}
          value={formatMoney(m?.revenueCalendarMonth ?? 0)}
          subtitle="Takvim ayı sipariş toplamı"
          icon={Gavel}
          tone="blue"
        />
        <MetricCard
          title={`${monthLabel} giderleri`}
          value={formatMoney(m?.expenseCalendarMonth ?? 0)}
          subtitle="Kayıtlı gider hareketleri"
          icon={Tag}
          tone="rose"
        />
        <MetricCard
          title="Bugünkü tahsilat"
          value={formatMoney(m?.collectionToday ?? 0)}
          subtitle="Gelir (tahsilat) kayıtları — bugün"
          icon={Wallet}
          tone="cyan"
        />
        <MetricCard
          title="Net varlık görünümü"
          value={formatMoney(netWorth)}
          subtitle="Kasa toplamı eksi kayıtlı borçlar"
          icon={TrendingUp}
          tone="emerald"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Son 7 gün" subtitle="Ciro (sipariş) ve gider trendi">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashExpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#cbd5e1" }} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact",
                    compactDisplay: "short",
                    maximumFractionDigits: 1,
                  }).format(Number(v) || 0)
                }
              />
              <Tooltip
                formatter={formatMoneyTooltip}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload;
                  if (p?.date) return `${label} · ${p.date}`;
                  return String(label ?? "");
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Ciro"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#dashRevFill)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Gider"
                stroke="#e11d48"
                strokeWidth={2}
                fill="url(#dashExpFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Son 7 gün" subtitle="Günlük tahsilat (gelir kayıtları)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#cbd5e1" }} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact",
                    compactDisplay: "short",
                    maximumFractionDigits: 1,
                  }).format(Number(v) || 0)
                }
              />
              <Tooltip
                formatter={formatMoneyTooltip}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload;
                  if (p?.date) return `${label} · ${p.date}`;
                  return String(label ?? "");
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="collection" name="Tahsilat" fill="#0891b2" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {series == null ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <BarChart3 className="h-4 w-4 shrink-0 opacity-80" />
          Grafik serisi alınamadı; sayfayı yenileyin.
        </p>
      ) : null}
    </div>
  );
}
