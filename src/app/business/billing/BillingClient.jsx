"use client";

import { useMemo, useState, useEffect } from "react";
import Script from "next/script";
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Zap,
  CalendarClock,
  BadgeCheck,
  Mail,
} from "lucide-react";

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight">
            {value}
          </p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "blue",
  disabled = false,
  className = "",
}) {
  const tones = {
    blue: "border-blue-700 bg-blue-600 text-white hover:bg-blue-700",
    white: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    emerald: "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function statusMeta(status, expired) {
  if (expired) {
    return {
      label: "SÜRE DOLDU",
      tone: "rose",
      badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
      iconWrap: "bg-rose-500 shadow-rose-500/20",
    };
  }

  if (status === "TRIAL") {
    return {
      label: "DENEME SÜRÜMÜ",
      tone: "amber",
      badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
      iconWrap: "bg-amber-500 shadow-amber-500/20",
    };
  }

  return {
    label: "AKTİF",
    tone: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    iconWrap: "bg-emerald-500 shadow-emerald-500/20",
  };
}

export default function BillingClient({ subscription, isExpiredParams, paymentNotice }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paytrToken, setPaytrToken] = useState(null);
  const [initError, setInitError] = useState(null);
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMsg, setGrantMsg] = useState(null);
  const [expireLoading, setExpireLoading] = useState(false);
  const [expireMsg, setExpireMsg] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !paytrToken) return undefined;
    const t = setTimeout(() => {
      const resize = window["iFrameResize"];
      if (typeof resize === "function") {
        try {
          resize({}, "#paytriframe");
        } catch {
          /* ignore */
        }
      }
    }, 200);
    return () => clearTimeout(t);
  }, [paytrToken]);

  const handleRenew = async () => {
    setIsLoading(true);
    setInitError(null);
    setPaytrToken(null);
    try {
      const res = await fetch("/api/payments/paytr/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInitError(data.error || "Ödeme başlatılamadı.");
        return;
      }
      if (!data.ok || !data.token) {
        setInitError(data.error || "Ödeme oturumu oluşturulamadı.");
        return;
      }
      setPaytrToken(data.token);
    } catch {
      setInitError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantMonth = async () => {
    setGrantLoading(true);
    setGrantMsg(null);
    try {
      const res = await fetch("/api/business/subscription/grant-month", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setGrantMsg(data.error || "İşlem başarısız.");
        return;
      }
      setGrantMsg("1 aylık abonelik eklendi. Sayfa yenileniyor...");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setGrantMsg("Bağlantı hatası.");
    } finally {
      setGrantLoading(false);
    }
  };

  const handleDevExpireSubscription = async () => {
    setExpireLoading(true);
    setExpireMsg(null);
    try {
      const res = await fetch("/api/business/subscription/dev-expire", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setExpireMsg(data.error || "İşlem başarısız.");
        return;
      }
      setExpireMsg("Abonelik süresi dolduruldu. Sayfa yenileniyor...");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setExpireMsg("Bağlantı hatası.");
    } finally {
      setExpireLoading(false);
    }
  };

  const closePaytr = () => {
    setPaytrToken(null);
    setInitError(null);
  };

  if (!subscription) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <CreditCard className="h-4 w-4" />
                Fatura ve Abonelik
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Abonelik Bulunamadı
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                İşletme hesabınıza bağlı bir abonelik kaydı bulunamadı.
              </p>
            </div>

            <div className="p-8">
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-rose-500 shadow-sm">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-rose-900">
                      Abonelik kaydı bulunamadı
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-rose-800/85">
                      İşletme hesabınıza bağlı bir abonelik kaydı bulunamadı.
                      Lütfen destek ekibiyle iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { status, plan, expiresAt, email } = subscription;
  const expiresDate = expiresAt ? new Date(expiresAt) : null;
  const isExpired =
    status === "EXPIRED" || (expiresDate ? expiresDate < new Date() : false);

  const daysLeft = useMemo(() => {
    if (!expiresDate || isExpired) return 0;
    return Math.max(
      0,
      Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24))
    );
  }, [expiresDate, isExpired]);

  const meta = statusMeta(status, isExpired);
  const planLabel = plan === "BASIC" ? "Aylık Erişim" : plan || "—";

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {paymentNotice === "success" ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
          >
            Ödeme işleminiz tamamlandı. Sonuç PayTR bildirimiyle hesabınıza yansır; birkaç dakika içinde
            abonelik durumunuz güncellenmezse sayfayı yenileyin.
          </div>
        ) : null}
        {paymentNotice === "fail" ? (
          <div
            role="status"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
          >
            Ödeme tamamlanamadı veya iptal edildi. Sorun devam ederse farklı bir kart deneyebilir veya destek ile
            iletişime geçebilirsiniz.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <CreditCard className="h-4 w-4" />
                  Fatura ve Abonelik
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Panel Kullanım Aboneliği
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Panel erişiminizi, kalan sürenizi ve abonelik yenileme durumunuzu
                  bu ekrandan takip edebilirsiniz.
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${meta.badgeClass}`}
              >
                <Zap className="h-4 w-4" />
                {meta.label}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Durum"
              value={meta.label}
              sub="Güncel abonelik statüsü"
              icon={ShieldCheck}
              tone={isExpired ? "slate" : status === "TRIAL" ? "amber" : "emerald"}
            />
            <StatCard
              title="Kalan Süre"
              value={`${daysLeft} Gün`}
              sub={expiresDate ? `Bitiş: ${expiresDate.toLocaleDateString("tr-TR")}` : "Tarih yok"}
              icon={CalendarClock}
              tone="blue"
            />
            <StatCard
              title="Plan"
              value={planLabel}
              sub="Aktif paket türü"
              icon={BadgeCheck}
              tone="amber"
            />
            <StatCard
              title="Bildirim E-Postası"
              value={email || "Tanımsız"}
              sub="Abonelik bilgilendirmeleri"
              icon={Mail}
              tone="slate"
            />
          </div>
        </section>

        {(isExpired || isExpiredParams) ? (
          <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white p-3 text-rose-500 shadow-sm">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="max-w-4xl">
                <h3 className="text-lg font-bold text-rose-900">
                  Panel erişiminiz kısıtlandı
                </h3>
                <p className="mt-2 text-sm leading-6 text-rose-800/85">
                  Abonelik veya deneme süreniz dolduğu için işletme paneline erişiminiz
                  durdurulmuştur.
                </p>
                <p className="mt-2 text-sm leading-6 text-rose-800/85">
                  İşletme profiliniz, müşteri yorumlarınız ve SEO görünürlüğünüz yayında
                  kalmaya devam eder. Yeni talepleri görmek ve paneli tekrar kullanmak
                  için aboneliğinizi yenileyebilirsiniz.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">Abonelik Özeti</h3>
              <p className="mt-1 text-sm text-slate-500">
                Mevcut plan detayları ve sistem bilgilendirmeleri
              </p>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl ${meta.iconWrap}`}
                    >
                      <Zap className="h-7 w-7 fill-current opacity-95" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Mevcut Durum
                      </p>
                      <h4 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                        {meta.label}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {isExpired
                      ? "Panel erişiminiz şu an pasif durumda. Yenileme sonrası tüm özellikler tekrar aktif olur."
                      : status === "TRIAL"
                      ? "Deneme süreniz devam ediyor. Süre bitmeden aboneliğinizi aktifleştirebilirsiniz."
                      : "Aboneliğiniz aktif. Tüm panel özelliklerini kullanmaya devam edebilirsiniz."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Plan Bilgisi
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                    {planLabel}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    Tüm panel özellikleri dahil
                  </div>
                </div>
              </div>

              {email ? (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="text-sm leading-6 text-slate-600">
                      Abonelik ve sistem bildirimleri şu e-posta adresine gönderilir:
                      <br />
                      <strong className="text-slate-900">{email}</strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
            <div className="p-6 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                <ShieldCheck className="h-4 w-4" />
                Güvenli Ödeme
              </div>

              <h3 className="text-2xl font-black tracking-tight">
                Aboneliği Yenile
              </h3>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black leading-none text-white">299</span>
                <span className="pb-1 text-lg font-semibold text-slate-400">₺ / ay</span>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "Sınırsız talep yönetimi",
                  "Müşteri yorum modülü",
                  "Gelişmiş analitik raporları",
                  "Ortaklık ve gelir programı",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium text-slate-300"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              {initError ? (
                <p className="mt-4 text-center text-sm font-medium text-rose-300">{initError}</p>
              ) : null}

              {process.env.NEXT_PUBLIC_SUBSCRIPTION_GRANT_MONTH_UI === "1" ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                    Geçici (dev)
                  </p>
                  <button
                    type="button"
                    onClick={handleGrantMonth}
                    disabled={grantLoading || expireLoading}
                    className="mt-2 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {grantLoading ? "Ekleniyor..." : "1 Aylık Abonelik Ekle"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDevExpireSubscription}
                    disabled={grantLoading || expireLoading}
                    className="mt-2 w-full rounded-xl border border-rose-400/50 bg-rose-500/20 px-4 py-2.5 text-sm font-black text-rose-100 hover:bg-rose-500/30 disabled:opacity-60"
                  >
                    {expireLoading ? "Uygulanıyor..." : "Aboneliğin Süresini Doldur (dev)"}
                  </button>
                  {grantMsg ? (
                    <p className="mt-2 text-xs font-semibold text-white/80">{grantMsg}</p>
                  ) : null}
                  {expireMsg ? (
                    <p className="mt-2 text-xs font-semibold text-white/80">{expireMsg}</p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-white/60">
                    Not: Bu alan geçicidir, sonradan kaldırılacaktır.
                  </p>
                </div>
              ) : null}

              <ActionButton
                onClick={handleRenew}
                disabled={isLoading}
                icon={CreditCard}
                tone="blue"
                className="mt-8 w-full"
              >
                {isLoading ? "Hazırlanıyor..." : "Şimdi Yenile"}
              </ActionButton>

              <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                PayTR altyapısı ile güvenli ödeme
              </p>
            </div>
          </section>
        </div>
      </div>

      {paytrToken ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-bold text-slate-900">Güvenli ödeme</span>
              <button
                type="button"
                onClick={closePaytr}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Kapat
              </button>
            </div>
            <iframe
              id="paytriframe"
              src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
              title="PayTR ödeme"
              className="h-[min(560px,75vh)] w-full border-0"
              allow="payment *"
            />
            <Script
              key={paytrToken}
              src="https://www.paytr.com/js/iframeResizer.min.js"
              strategy="afterInteractive"
              onLoad={() => {
                const resize = window["iFrameResize"];
                if (typeof resize === "function") {
                  try {
                    resize({}, "#paytriframe");
                  } catch {
                    /* ignore */
                  }
                }
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}