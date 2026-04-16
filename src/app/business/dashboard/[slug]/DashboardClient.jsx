"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Banknote,
  CalendarDays,
  Settings,
  Megaphone,
  ExternalLink,
  ChevronDown,
  Store,
  ArrowRight,
  Wallet,
  BellRing,
  Clock3,
  ReceiptText,
  CircleUser,
  ClipboardList,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/providers/SocketProvider";
import OnboardingCompletion from "@/components/business/OnboardingCompletion";
import BroadcastSlot from "@/components/broadcast/BroadcastSlot";
import DashboardAnalyticsSection from "@/components/business/DashboardAnalyticsSection";
import DashboardTopSummarySection from "@/components/business/DashboardTopSummarySection";
import DashboardModuleSummaries from "@/components/business/DashboardModuleSummaries";

const formatMoney = (value) => {
  if (value == null || Number.isNaN(value)) return "₺0,00";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

function SurfaceCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-[0_10px_35px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-lg font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

function QuickLinkCard({ href, title, desc, icon: Icon, iconClassName }) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_34px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`rounded-2xl p-3 ${iconClassName || "bg-slate-100 text-slate-700"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}

function SidebarListCard({
  title,
  tone = "green",
  icon: Icon,
  emptyText,
  items = [],
}) {
  const headTone = {
    green: "from-emerald-600 to-emerald-500",
    blue: "from-blue-600 to-indigo-600",
    red: "from-rose-600 to-red-600",
  };

  return (
    <SurfaceCard className="overflow-hidden">
      <div className={`bg-gradient-to-r ${headTone[tone]} px-4 py-3 text-white`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 opacity-90" />
            <span className="text-sm font-bold">{title}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </div>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3"
              >
                <span className="truncate text-sm font-medium text-slate-700">
                  {row.title}
                </span>
                <span className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">
                  {formatMoney(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SurfaceCard>
  );
}

function DashboardOverview({ business, m, isConnected }) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_30%)]" />
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <DashboardTopSummarySection
            business={business}
            m={m}
            isConnected={isConnected}
            series={m?.topSummarySeries}
          />

          <div className="border-t border-white/10 px-6 pb-8 pt-2 md:px-8">
            <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <CircleUser className="h-3.5 w-3.5 text-cyan-300/90" />
              Hesap
            </p>
            <div className="w-full rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-md md:p-5">
              <div className="flex min-h-0 min-w-0 flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:h-[4.5rem] sm:w-[4.5rem]">
                      <BarChart3 className="h-7 w-7 text-white/80" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="text-lg font-bold leading-tight text-white sm:text-xl">{business.name}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      Profil, üyelik ve işletme görünürlüğü
                    </p>
                  </div>
                </div>

                <Link
                  href="/business/onboarding"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:w-auto sm:justify-center"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                  Profil %{business.completion ?? 0}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6 min-w-0">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SurfaceCard className="p-5 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Varlıklar
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-700">
                    İşletme finansal gücü
                  </h3>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

              <p className="border-b border-dashed border-slate-200 pb-4 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(m?.assetsTotal ?? 0)}
              </p>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Nakit, hesap bakiyesi ve tanımlı diğer finansal varlıkların
                toplam özeti.
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-5 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Borçlar
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-700">
                    Kısa ve orta vadeli yükümlülükler
                  </h3>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                  <ReceiptText className="h-5 w-5" />
                </div>
              </div>

              <p className="border-b border-dashed border-slate-200 pb-4 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(m?.debtsTotal ?? 0)}
              </p>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Tedarikçi, kredi ve diğer kayıtlı finansal yükümlülüklerin
                toplam görünümü.
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-5 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Günlük Akış
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-700">
                    Anlık operasyon özeti
                  </h3>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3">
                <MiniStat
                  label="Bugünkü Satış"
                  value={formatMoney(m?.revenueToday ?? 0)}
                  icon={ShoppingCart}
                />
                <MiniStat
                  label="Bugünkü Tahsilat"
                  value={formatMoney(m?.collectionToday ?? 0)}
                  icon={Banknote}
                />
              </div>
            </SurfaceCard>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 self-start">
          <SurfaceCard className="overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 opacity-90" />
                  <span className="text-sm font-bold">Duyurular</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <ExternalLink className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Civardaki işletme paneli güncellemeleri, sistem duyuruları ve
                  önemli bilgilendirmeler burada gösterilecek.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SidebarListCard
            title="Yaklaşan Masraflar"
            tone="blue"
            icon={CalendarDays}
            items={m?.upcomingExpenses ?? []}
            emptyText="Yaklaşan ödeme kaydınız bulunmuyor."
          />

          <SidebarListCard
            title="Yaklaşan Kredi Ödemeleri"
            tone="red"
            icon={ReceiptText}
            items={m?.upcomingLoans ?? []}
            emptyText="Yaklaşan kredi ödemesi kaydınız bulunmuyor."
          />
        </aside>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { status } = useSession();
  const { socket, isConnected } = useSocket();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/business/dashboard-summary", {
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onNewOrder = () => setRefreshKey((k) => k + 1);
    socket.on("new_order", onNewOrder);

    return () => socket.off("new_order", onNewOrder);
  }, [socket, isConnected]);

  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const business = data?.business;
  const m = data?.metrics;

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="min-h-[520px] rounded-[32px] bg-slate-200/80" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-[24px] bg-slate-200/70" />
          <div className="h-64 rounded-[24px] bg-slate-200/70" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-[28px] bg-slate-200/70" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !business) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <BarChart3 className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Panel verisi yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Dashboard özet verileri alınamadı. Lütfen tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardAnalyticsSection />

      <DashboardOverview business={business} m={m} isConnected={isConnected} />

      <BroadcastSlot layout="BANNER" audience="BUSINESS" />

      {business.completion < 100 && (
        <OnboardingCompletion
          score={business.completion}
          pendingTasks={business.missingSteps || []}
        />
      )}

      {(m?.leadCountNew ?? 0) > 0 && (
        <div className="rounded-[24px] border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-[0_8px_24px_rgba(99,102,241,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-600 p-3 text-white">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-950">
                  {m.leadCountNew} yeni hizmet talebi
                </h3>
                <p className="text-xs text-indigo-700">
                  Yeni talepler panelinize ulaştı. İnceleyip hızlı dönüş yapın.
                </p>
              </div>
            </div>

            <Link
              href="/business/leads"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Taleplere Git
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {(m?.pendingReservationCount ?? 0) > 0 && (
        <div className="rounded-[24px] border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-pink-50 p-4 shadow-[0_8px_24px_rgba(217,70,239,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-fuchsia-600 p-3 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-fuchsia-950">
                  {m.pendingReservationCount} randevu talebi
                </h3>
                <p className="text-xs text-fuchsia-700">
                  Onay bekleyen rezervasyonlar mevcut.
                </p>
              </div>
            </div>

            <Link
              href="/business/reservations"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-700"
            >
              Rezervasyonlar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <DashboardModuleSummaries
        navModules={m?.navModules}
        businessType={business?.businessType}
      />

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Hızlı Erişim
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Sık kullanılan modüller
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <QuickLinkCard
            href="/business/planning"
            title="İş Planlama"
            desc="Projeler, görevler ve operasyon planını tek yerden takip edin."
            icon={ClipboardList}
            iconClassName="bg-amber-50 text-amber-800"
          />
          <QuickLinkCard
            href="/business/orders"
            title="Siparişler"
            desc="Yeni siparişleri, süreç durumlarını ve operasyon akışını yönetin."
            icon={ShoppingCart}
            iconClassName="bg-cyan-50 text-cyan-700"
          />
          <QuickLinkCard
            href="/business/products"
            title="Ürünler"
            desc="Ürün kataloğu, stok yapısı ve içerik düzenlemelerini yönetin."
            icon={BarChart3}
            iconClassName="bg-violet-50 text-violet-700"
          />
          <QuickLinkCard
            href="/business/civardaki-magaza"
            title="Civardaki Mağaza"
            desc="Mağaza vitrinini, görünürlüğü ve mağaza içeriklerini düzenleyin."
            icon={Store}
            iconClassName="bg-emerald-50 text-emerald-700"
          />
          <QuickLinkCard
            href="/business/settings/menu-customization"
            title="Menü Ayarları"
            desc="İşletme menüsünü, gezinme yapısını ve görünür modülleri özelleştirin."
            icon={Settings}
            iconClassName="bg-blue-50 text-blue-700"
          />
        </div>
      </section>
    </div>
  );
}