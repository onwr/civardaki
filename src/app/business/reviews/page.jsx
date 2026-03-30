"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Clock,
  Search,
  Reply,
  Flag,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Sparkles,
  PieChart,
  Target,
  Package,
  Utensils,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-500 to-orange-600 text-white",
    rose: "from-rose-500 to-pink-700 text-white",
    slate: "from-slate-800 to-slate-950 text-white",
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

function FilterTabs({ filter, setFilter }) {
  const items = [
    { id: "all", label: "Tümü", icon: MessageSquare },
    { id: "pending", label: "Bekleyen", icon: Clock },
    { id: "replied", label: "Yanıtlanan", icon: CheckCircle2 },
    { id: "critical", label: "Kritik", icon: AlertCircle },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = filter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
              active
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function MetricBadge({ label, value, icon }) {
  const valueLabel = value === 3 ? "Harika" : value === 2 ? "İyi" : "Zayıf";
  const tone =
    value === 3
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === 2
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>
          {valueLabel}
        </span>
      </div>
    </div>
  );
}

export default function BusinessReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/business/reviews");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReviews(data);
    } catch (err) {
      setError(err.message);
      toast.error("Yorumlar yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText.trim()) return toast.error("Lütfen bir yanıt yazın.");

    try {
      const res = await fetch("/api/business/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, replyContent: replyText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReviews((prev) => prev.map((r) => (r.id === id ? data : r)));
      toast.success("Yanıtınız başarıyla yayınlandı!", {
        description: "Müşteriye bildirim gönderildi.",
      });
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      toast.error("Yanıt gönderilirken bir hata oluştu.");
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/business/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      const data = await res.json();
      if (data.message && !data.success) throw new Error(data.message);
      if (data.error) throw new Error(data.error);

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r)),
      );

      toast.success("Yorum onaylandı.", {
        description: "Yorum artık işletme sayfanızda görünecek.",
      });
    } catch (err) {
      toast.error(err.message || "Onaylama başarısız.");
    }
  };

  const handleReport = async (id) => {
    try {
      const res = await fetch(`/api/business/reviews/${id}/report`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, reportedAt: new Date().toISOString() } : r,
        ),
      );

      toast.success("Şikayet iletildi.", {
        description: "İnceleme ekibimiz en kısa sürede değerlendirecektir.",
      });
    } catch (err) {
      toast.error(err.message || "Bildirim gönderilemedi.");
    }
  };

  const filteredReviews = reviews
    .filter((review) => {
      const hasReplied = !!review.replyContent;
      if (filter === "pending") return !hasReplied;
      if (filter === "replied") return hasReplied;
      if (filter === "critical") return review.rating <= 2;
      return true;
    })
    .filter(
      (review) =>
        (review.reviewerName || "Anonim")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (review.content || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
  const pendingCount = reviews.filter((r) => !r.replyContent).length;
  const criticalCount = reviews.filter((r) => r.rating <= 2).length;
  const repliedCount = reviews.filter((r) => !!r.replyContent).length;

  const getParsedMetrics = (review) => {
    try {
      return review.metrics
        ? JSON.parse(review.metrics)
        : { quality: 3, speed: 3, packaging: 3 };
    } catch (e) {
      return { quality: 3, speed: 3, packaging: 3 };
    }
  };

  const metricsStats = reviews.reduce(
    (acc, r) => {
      const m = getParsedMetrics(r);
      acc.quality += m.quality || 0;
      acc.speed += m.speed || 0;
      acc.packaging += m.packaging || 0;
      return acc;
    },
    { quality: 0, speed: 0, packaging: 0 },
  );

  const metricsAverage =
    totalReviews > 0
      ? {
          quality: Math.round((metricsStats.quality / (totalReviews * 3)) * 100),
          speed: Math.round((metricsStats.speed / (totalReviews * 3)) * 100),
          packaging: Math.round((metricsStats.packaging / (totalReviews * 3)) * 100),
        }
      : { quality: 0, speed: 0, packaging: 0 };

  const getMetricIcon = (key) => {
    switch (key) {
      case "quality":
        return <Utensils className="h-4 w-4" />;
      case "speed":
        return <Clock className="h-4 w-4" />;
      case "packaging":
        return <Package className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMetricLabel = (key) => {
    switch (key) {
      case "quality":
        return "Lezzet / Kalite";
      case "speed":
        return "Hız";
      case "packaging":
        return "Sunum / Paket";
      default:
        return key;
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <MessageSquare className="h-4 w-4" />
                  Müşteri Deneyimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Yorum ve Geri Bildirim Merkezi
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Müşteri yorumlarını izleyin, hızlı yanıt verin, kritik geri
                  bildirimleri yönetin ve genel memnuniyet görünümünü tek ekranda
                  takip edin.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Ortalama Puan
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{averageRating} / 5.0</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAISummaryOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  <Sparkles className="h-4 w-4" />
                  {isAISummaryOpen ? "AI Özeti Gizle" : "AI Özeti Aç"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Yorum"
              value={totalReviews}
              sub="Tüm geri bildirimler"
              icon={BarChart3}
              tone="blue"
            />
            <StatCard
              title="Yanıt Bekleyen"
              value={pendingCount}
              sub="Cevaplanması gereken yorumlar"
              icon={Clock}
              tone="amber"
            />
            <StatCard
              title="Yanıtlanan"
              value={repliedCount}
              sub="İşlem tamamlanan yorumlar"
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              title="Kritik Yorum"
              value={criticalCount}
              sub="2 yıldız ve altı puanlar"
              icon={AlertCircle}
              tone="rose"
            />
          </div>
        </section>

        <AnimatePresence>
          {isAISummaryOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
            >
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
                <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                      <PieChart className="h-4 w-4" />
                      AI Müşteri Analizi
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Son yorumlara göre öne çıkan içgörü
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-blue-100/90">
                      Son 30 günde müşterileriniz en çok{" "}
                      <span className="font-bold text-white">lezzet / kalite</span> ve{" "}
                      <span className="font-bold text-white">genel memnuniyet</span>{" "}
                      alanlarında olumlu geri bildirim bırakıyor. Buna karşılık
                      yoğun saatlerde yaşanan{" "}
                      <span className="font-bold text-white">teslimat hızı</span>{" "}
                      sorunu genel puanı aşağı çekebiliyor.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">
                        #LezzetGücü
                      </span>
                      <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">
                        #Hızİyileştirme
                      </span>
                      <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">
                        #MüşteriMemnuniyeti
                      </span>
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-white/10 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                        Metrik Ortalamaları
                      </p>
                      <button
                        onClick={() => setIsAISummaryOpen(false)}
                        className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          label: "Lezzet / Kalite",
                          val: metricsAverage.quality,
                          color: "bg-emerald-400",
                        },
                        {
                          label: "Hız",
                          val: metricsAverage.speed,
                          color: "bg-amber-400",
                        },
                        {
                          label: "Sunum / Paket",
                          val: metricsAverage.packaging,
                          color: "bg-blue-400",
                        },
                      ].map((m) => (
                        <div key={m.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{m.label}</span>
                            <span>%{m.val}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.val}%` }}
                              className={`h-full ${m.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <SectionCard
          title="Yorum Filtreleri"
          subtitle="Yorumları duruma ve metne göre daraltın"
          right={<FilterTabs filter={filter} setFilter={setFilter} />}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Müşteri adı veya yorum metni içerisinde ara..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </SectionCard>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <SectionCard title="Bir sorun oluştu" subtitle="Yorumlar yüklenemedi">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          </SectionCard>
        ) : filteredReviews.length === 0 ? (
          <SectionCard
            title="Sonuç bulunamadı"
            subtitle="Aradığınız filtrelere uygun yorum yok"
          >
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <MessageSquare className="mb-4 h-14 w-14 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">
                Aradığınız kriterlere uygun yorum bulunamadı.
              </p>
              <button
                onClick={async () => {
                  setIsLoading(true);
                  await fetch("/api/business/reviews/seed", { method: "POST" });
                  await fetchReviews();
                }}
                className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Demo yorumları yükle
              </button>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review) => {
                const metrics = getParsedMetrics(review);

                return (
                  <motion.div
                    layout
                    key={review.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                  >
                    <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                      <aside className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                            <User className="h-7 w-7" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {review.reviewerName || "Anonim"}
                            </h4>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Müşteri
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="space-y-2">
                          {Object.entries(metrics).map(([key, val]) => (
                            <MetricBadge
                              key={key}
                              label={getMetricLabel(key)}
                              value={val}
                              icon={getMetricIcon(key)}
                            />
                          ))}
                        </div>
                      </aside>

                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                            <Clock className="h-4 w-4" />
                            {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            {!review.isApproved && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                Onay Bekliyor
                              </span>
                            )}
                            {review.reportedAt && (
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                                Bildirildi
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-[15px] leading-7 text-slate-700">
                            “{review.content}”
                          </p>
                        </div>

                        {review.replyContent ? (
                          <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <Reply className="h-4 w-4 -scale-x-100 text-blue-700" />
                              <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                                İşletme Yanıtı
                              </span>
                            </div>

                            <p className="text-sm leading-7 text-slate-700">
                              {review.replyContent}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {!review.isApproved && (
                                <button
                                  onClick={() => handleApprove(review.id)}
                                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Onayla
                                </button>
                              )}

                              <button
                                onClick={() => handleReport(review.id)}
                                disabled={!!review.reportedAt}
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Flag className="h-4 w-4" />
                                {review.reportedAt ? "Bildirildi" : "Bildir"}
                              </button>
                            </div>
                          </div>
                        ) : replyingTo === review.id ? (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                          >
                            <textarea
                              autoFocus
                              rows="4"
                              placeholder="Müşterinize profesyonel ve sıcak bir yanıt yazın..."
                              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => handleSendReply(review.id)}
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                              >
                                Yanıtı yayınla
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                              >
                                Vazgeç
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {!review.isApproved && (
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Onayla
                              </button>
                            )}

                            <button
                              onClick={() => setReplyingTo(review.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Reply className="h-4 w-4 -scale-x-100" />
                              Yanıtla
                            </button>

                            <button
                              onClick={() => handleReport(review.id)}
                              disabled={!!review.reportedAt}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Flag className="h-4 w-4" />
                              {review.reportedAt ? "Bildirildi" : "Bildir"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-lg">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Müşteri puanını yükseltme ipucu
              </h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Olumsuz yorumlara ilk 2 saat içinde verilen nazik ve çözüm odaklı
                yanıtlar, müşterinin yorumunu güncelleme olasılığını ciddi şekilde
                artırır.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}