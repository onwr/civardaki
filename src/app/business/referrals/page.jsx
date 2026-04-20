"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Share2,
  Copy,
  Gift,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  Link as LinkIcon,
  Megaphone,
  BadgeCheck,
} from "lucide-react";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-500 to-orange-600 text-white",
    purple: "from-purple-600 to-violet-700 text-white",
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

function InfoMiniCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="mb-2 h-5 w-5 text-white" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [business, setBusiness] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/business/dashboard-summary", {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || "Veriler alınamadı.");

        if (!cancelled) {
          setBusiness(data.business || null);
          setMetrics(data.metrics || null);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e.message || "Ortaklık ve gelir verileri alınamadı.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const referralLink = useMemo(() => {
    const code = business?.referralCode;
    if (!code) return "";
    return `https://civardaki.com/r/${code}`;
  }, [business?.referralCode]);

  const referralStats = metrics?.referralStats || {
    totalInvited: 0,
    totalActive: 0,
  };

  const referralHistory = Array.isArray(metrics?.referralHistory)
    ? metrics.referralHistory
    : [];

  const pendingCount = referralHistory.filter(
    (item) => item.status !== "ACTIVE",
  ).length;

  const handleCopy = async () => {
    if (!referralLink) {
      toast.error("Önce ortaklık kodunuz oluşmalı.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Davet linki kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalama başarısız. Tarayıcı iznini kontrol edin.");
    }
  };

  const handleShareWhatsApp = () => {
    if (!referralLink) return;
    const text = `Civardaki.com'a davetlisin. Bu link ile kaydol: ${referralLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareTwitter = () => {
    if (!referralLink) return;
    const text = `Civardaki.com'a davetlisin! ${referralLink}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Share2 className="h-4 w-4" />
                  Ortaklık ve gelir
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Ortaklık ve gelir merkezi
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Davet bağlantınızı paylaşarak yeni işletmeler katılsın; aktif dönüşümleri
                  ve gelir fırsatlarını tek ekranda takip edin.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <InfoMiniCard
                  icon={Gift}
                  label="Ortaklık kodu"
                  value={business?.referralCode || "Henüz yok"}
                />
                <InfoMiniCard
                  icon={BadgeCheck}
                  label="Aktif Dönüşüm"
                  value={`${referralStats.totalActive} işletme`}
                />
                <InfoMiniCard
                  icon={Users}
                  label="Toplam Davet"
                  value={`${referralStats.totalInvited} kayıt`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Davet"
              value={referralStats.totalInvited}
              sub="Paylaşılan bağlantıdan gelen kayıtlar"
              icon={Users}
              tone="blue"
            />
            <StatCard
              title="Aktif İşletme"
              value={referralStats.totalActive}
              sub="Onaylanan veya aktifleşen kayıtlar"
              icon={TrendingUp}
              tone="emerald"
            />
            <StatCard
              title="Bekleyen Kayıt"
              value={pendingCount}
              sub="Henüz aktif olmayan davetler"
              icon={Gift}
              tone="amber"
            />
            <StatCard
              title="Ortaklık kodu"
              value={business?.referralCode || "-"}
              sub="Size özel tanımlanan kod"
              icon={Sparkles}
              tone="purple"
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard
            title="Davet bağlantınız"
            subtitle="Davet linkinizi kopyalayın veya doğrudan paylaşın"
          >
            <div className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-700">
                      {referralLink || "Davet linki hazırlanıyor..."}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  WhatsApp ile paylaş
                </button>

              </div>
            </div>
          </SectionCard>

          <SectionCard title="Program özeti" subtitle="Ortaklık ve gelir programının kısa özeti">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Kazanç Mantığı
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Davet linkinizle gelen işletmeler sistem tarafından sizin ortaklık
                  davetiniz olarak işaretlenir.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Takip
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Davet edilen işletmelerin beklemede veya aktif durumda olup olmadığını
                  aşağıdaki geçmiş listesinden takip edebilirsiniz.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Davet geçmişi"
          subtitle="Davet bağlantınız üzerinden gelen son kayıtlar"
          right={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              Son {referralHistory.length} kayıt
            </span>
          }
        >
          {referralHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <Users className="mb-4 h-14 w-14 text-slate-300" />
              <p className="text-lg font-semibold text-slate-700">
                Henüz davet geçmişiniz bulunmuyor
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Linkinizi paylaştığınızda yeni kayıtlar burada görünmeye başlayacak.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {referralHistory.map((item) => {
                const isActive = item.status === "ACTIVE";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-bold text-slate-500 shadow-sm">
                          {String(item.invitedBizName || "B").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.invitedBizName || "İsimsiz işletme"}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${
                            isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isActive ? "Onaylandı" : "Beklemede"}
                        </span>

                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                          {item.reward ? item.reward : "-"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <Megaphone className="h-4 w-4" />
                Gelir Ortaklığı
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Kitleniz güçlüyse gelir ortağı olun
              </h2>
              <p className="mt-2 text-sm leading-7 text-blue-100/90">
                Geniş bir çevreniz veya görünürlüğünüz varsa, sistem için daha kapsamlı
                iş ortaklığı başvurusu oluşturabilirsiniz.
              </p>
            </div>

            <Link
              href="/business/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Başvuru oluştur
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}