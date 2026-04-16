"use client";

import { useMemo, useState, useEffect } from "react";
import Script from "next/script";
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  CalendarClock,
  BadgeCheck,
  Mail,
  ArrowRight,
  Lock,
  Zap,
  Receipt,
  Crown,
  X,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function statusMeta(status, expired) {
  if (expired) {
    return {
      label: "SÜRESİ DOLDU",
      tone: "rose",
      badgeClass:
        "border border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100/50",
      glow: "from-rose-500/20 via-rose-400/10 to-transparent",
      iconWrap: "bg-rose-500 text-white shadow-lg shadow-rose-500/20",
      cardTint: "border-rose-200 bg-rose-50/70",
    };
  }

  if (status === "TRIAL") {
    return {
      label: "DENEME SÜRÜMÜ",
      tone: "amber",
      badgeClass:
        "border border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50",
      glow: "from-amber-500/20 via-yellow-400/10 to-transparent",
      iconWrap: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
      cardTint: "border-amber-200 bg-amber-50/70",
    };
  }

  return {
    label: "AKTİF",
    tone: "emerald",
    badgeClass:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50",
    glow: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    iconWrap: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    cardTint: "border-emerald-200 bg-emerald-50/70",
  };
}

function InfoCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = "blue",
  large = false,
}) {
  const accents = {
    blue: {
      ring: "ring-blue-100",
      icon: "bg-blue-600 text-white shadow-blue-600/20",
      pill: "text-blue-700 bg-blue-50 border-blue-100",
    },
    emerald: {
      ring: "ring-emerald-100",
      icon: "bg-emerald-600 text-white shadow-emerald-600/20",
      pill: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    amber: {
      ring: "ring-amber-100",
      icon: "bg-amber-500 text-white shadow-amber-500/20",
      pill: "text-amber-700 bg-amber-50 border-amber-100",
    },
    slate: {
      ring: "ring-slate-100",
      icon: "bg-slate-900 text-white shadow-slate-900/20",
      pill: "text-slate-700 bg-slate-50 border-slate-200",
    },
    rose: {
      ring: "ring-rose-100",
      icon: "bg-rose-500 text-white shadow-rose-500/20",
      pill: "text-rose-700 bg-rose-50 border-rose-100",
    },
  };

  const tone = accents[accent] || accents.blue;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(15,23,42,0.10)]",
        tone.ring,
        large && "md:col-span-2"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-50/90 to-transparent" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
              tone.pill
            )}
          >
            {title}
          </div>

          <div
            className={cn(
              "mt-4 break-words font-black tracking-tight text-slate-950",
              large ? "text-3xl md:text-4xl" : "text-2xl"
            )}
          >
            {value}
          </div>

          {sub ? (
            <p className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-500">
              {sub}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xl",
            tone.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-300">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <span>{children}</span>
    </li>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-700 bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
        "shadow-[0_10px_25px_rgba(37,99,235,0.28)]",
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </button>
  );
}

function GhostButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

export default function BillingClient({
  subscription,
  isExpiredParams,
  paymentNotice,
}) {
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
          // ignore
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
      const res = await fetch("/api/business/subscription/grant-month", {
        method: "POST",
      });

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
      const res = await fetch("/api/business/subscription/dev-expire", {
        method: "POST",
      });

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
      <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_35%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 px-6 py-7 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_28%)]" />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                  <Receipt className="h-4 w-4" />
                  Fatura ve Abonelik
                </div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  Abonelik Bulunamadı
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  İşletme hesabınıza bağlı aktif bir abonelik kaydı bulunamadı.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-rose-500 shadow-sm">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-rose-900">
                      Abonelik kaydı bulunamadı
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-rose-800/85">
                      Bu işletme hesabı için abonelik kaydı tanımlı değil. Destek
                      ekibiyle iletişime geçerek hesabınıza abonelik tanımlatabilirsiniz.
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
  const progressPercent = useMemo(() => {
    if (!expiresDate || isExpired) return 0;
    if (daysLeft >= 30) return 100;
    return Math.max(6, Math.min(100, Math.round((daysLeft / 30) * 100)));
  }, [expiresDate, isExpired, daysLeft]);

  return (
    <div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        {paymentNotice === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
            Ödeme işleminiz tamamlandı. Sonuç PayTR bildirimiyle hesabınıza
            yansır; birkaç dakika içinde güncellenmezse sayfayı yenileyin.
          </div>
        ) : null}

        {paymentNotice === "fail" ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 shadow-sm">
            Ödeme tamamlanamadı veya iptal edildi. Sorun devam ederse farklı bir
            kart deneyebilir ya da destek ile iletişime geçebilirsiniz.
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/85 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0))]" />

          <div className="relative grid gap-6 px-5 py-5 md:px-7 md:py-7 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Fatura ve Abonelik Yönetimi
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Panel kullanım aboneliğini daha profesyonel şekilde yönetin
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
                Abonelik durumunuzu, kalan sürenizi ve ödeme işlemlerinizi tek
                ekrandan takip edin. Erişim durumunuz ve yenileme adımları burada
                net şekilde gösterilir.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]",
                    meta.badgeClass
                  )}
                >
                  <Zap className="h-4 w-4" />
                  {meta.label}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                  <Lock className="h-4 w-4" />
                  Güvenli ödeme akışı
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.18)]">
              <div className={cn("absolute inset-0 bg-gradient-to-br", meta.glow)} />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Mevcut plan
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight">
                      {planLabel}
                    </h3>
                  </div>

                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      meta.iconWrap
                    )}
                  >
                    <Crown className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span>Kalan kullanım süresi</span>
                    <span>{daysLeft} Gün</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-300">
                    {expiresDate
                      ? `Bitiş tarihi: ${expiresDate.toLocaleDateString("tr-TR")}`
                      : "Bitiş tarihi tanımlı değil"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            title="Durum"
            value={meta.label}
            sub="Güncel abonelik statüsü"
            icon={ShieldCheck}
            accent={
              isExpired ? "rose" : status === "TRIAL" ? "amber" : "emerald"
            }
          />

          <InfoCard
            title="Kalan Süre"
            value={`${daysLeft} Gün`}
            sub={
              expiresDate
                ? `Bitiş: ${expiresDate.toLocaleDateString("tr-TR")}`
                : "Tarih bulunamadı"
            }
            icon={CalendarClock}
            accent="blue"
          />

          <InfoCard
            title="Plan"
            value={planLabel}
            sub="Aktif paket türü"
            icon={BadgeCheck}
            accent="amber"
          />

          <InfoCard
            title="Bildirim E-Postası"
            value={email || "Tanımsız"}
            sub="Abonelik bilgilendirmeleri"
            icon={Mail}
            accent="slate"
          />
        </section>

        {(isExpired || isExpiredParams) && (
          <section className="overflow-hidden rounded-[28px] border border-rose-200 bg-white shadow-[0_10px_35px_rgba(244,63,94,0.08)]">
            <div className="grid gap-0 md:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center border-b border-rose-100 bg-rose-50 p-5 md:border-b-0 md:border-r">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-rose-500 shadow-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>

              <div className="p-5 md:p-6">
                <h3 className="text-lg font-black tracking-tight text-rose-900">
                  Panel erişiminiz şu anda kısıtlı
                </h3>
                <p className="mt-2 text-sm leading-7 text-rose-800/85">
                  Abonelik veya deneme süreniz dolduğu için işletme paneline erişim
                  durdurulmuştur.
                </p>
                <p className="mt-2 text-sm leading-7 text-rose-800/85">
                  İşletme profiliniz, yorumlarınız ve SEO görünürlüğünüz yayında
                  kalmaya devam eder. Paneli tekrar kullanmak için aboneliğinizi
                  yenilemeniz yeterlidir.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                Abonelik Özeti
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Mevcut kullanım durumu ve sistem bilgilendirmeleri
              </p>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div
                  className={cn(
                    "rounded-[28px] border p-5",
                    isExpired || status === "TRIAL"
                      ? meta.cardTint
                      : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl",
                        meta.iconWrap
                      )}
                    >
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Mevcut Durum
                      </p>
                      <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                        {meta.label}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-slate-600">
                    {isExpired
                      ? "Panel erişiminiz pasif durumda. Yenileme sonrasında tüm özellikler tekrar aktif olur."
                      : status === "TRIAL"
                      ? "Deneme süreniz devam ediyor. Süre bitmeden aboneliğinizi aktifleştirebilirsiniz."
                      : "Aboneliğiniz aktif. Panel özelliklerini kesintisiz kullanmaya devam edebilirsiniz."}
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Plan Bilgisi
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {planLabel}
                      </p>
                      <p className="text-sm text-slate-500">
                        Tüm panel özellikleri dahil
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Aktif kullanım hakları tek pakette
                  </div>
                </div>
              </div>

              {email ? (
                <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="text-sm leading-7 text-slate-600">
                      Abonelik ve sistem bilgilendirmeleri şu adrese gönderilir:
                      <br />
                      <strong className="font-bold text-slate-900">{email}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Güvenli ödeme altyapısı
                      </p>
                      <p className="text-xs leading-6 text-slate-500">
                        Ödemeler PayTR üzerinden güvenli şekilde alınır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Hızlı yenileme süreci
                      </p>
                      <p className="text-xs leading-6 text-slate-500">
                        Ödeme sonrası abonelik durumu kısa süre içinde güncellenir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[32px] border border-slate-900 bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)]" />

            <div className="relative p-6 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                <ShieldCheck className="h-4 w-4" />
                Güvenli Ödeme
              </div>

              <h3 className="text-2xl font-black tracking-tight">
                Aboneliği Yenile
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Panel erişimini kesintisiz sürdürmek için aylık aboneliğini şimdi
                yenileyebilirsin.
              </p>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black leading-none text-white">
                    299
                  </span>
                  <span className="pb-1 text-lg font-semibold text-slate-400">
                    ₺ / ay
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Tek paket, tam erişim
                </div>

                <ul className="mt-6 space-y-3">
                  <FeatureRow>Sınırsız talep yönetimi</FeatureRow>
                  <FeatureRow>Müşteri yorum modülü</FeatureRow>
                  <FeatureRow>Gelişmiş analitik raporları</FeatureRow>
                  <FeatureRow>Ortaklık ve gelir programı</FeatureRow>
                </ul>
              </div>

              {initError ? (
                <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                  {initError}
                </p>
              ) : null}

              {process.env.NEXT_PUBLIC_SUBSCRIPTION_GRANT_MONTH_UI === "1" ? (
                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">
                    Geçici geliştirme araçları
                  </p>

                  <PrimaryButton
                    onClick={handleGrantMonth}
                    disabled={grantLoading || expireLoading}
                    className="mt-3 w-full"
                  >
                    {grantLoading ? "Ekleniyor..." : "1 Aylık Abonelik Ekle"}
                  </PrimaryButton>

                  <GhostButton
                    onClick={handleDevExpireSubscription}
                    disabled={grantLoading || expireLoading}
                    className="mt-2 w-full border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                  >
                    {expireLoading
                      ? "Uygulanıyor..."
                      : "Aboneliğin Süresini Doldur (dev)"}
                  </GhostButton>

                  {grantMsg ? (
                    <p className="mt-2 text-xs font-semibold text-white/80">
                      {grantMsg}
                    </p>
                  ) : null}

                  {expireMsg ? (
                    <p className="mt-2 text-xs font-semibold text-white/80">
                      {expireMsg}
                    </p>
                  ) : null}

                  <p className="mt-2 text-[11px] leading-5 text-white/50">
                    Bu alan yalnızca geliştirme sürecinde kullanılmalıdır.
                  </p>
                </div>
              ) : null}

              <PrimaryButton
                onClick={handleRenew}
                disabled={isLoading}
                icon={CreditCard}
                className="mt-6 w-full"
              >
                {isLoading ? "Ödeme ekranı hazırlanıyor..." : "Şimdi Yenile"}
              </PrimaryButton>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                PayTR altyapısı ile güvenli ödeme
              </div>
            </div>
          </section>
        </div>
      </div>

      {paytrToken ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-5">
              <div>
                <p className="text-sm font-black tracking-tight text-slate-900">
                  Güvenli ödeme
                </p>
                <p className="text-xs text-slate-500">
                  PayTR ödeme ekranı güvenli bağlantı ile açıldı
                </p>
              </div>

              <button
                type="button"
                onClick={closePaytr}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <iframe
              id="paytriframe"
              src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
              title="PayTR ödeme"
              className="h-[min(620px,78vh)] w-full border-0"
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
                    // ignore
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