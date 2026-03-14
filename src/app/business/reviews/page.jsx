"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Reply,
  Flag,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
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

  // Dynamic Stats Calculation
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(
          1,
        )
      : "0.0";
  const pendingCount = reviews.filter((r) => !r.replyContent).length;

  // Parse metrics (assuming stored as JSON string)
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
          quality: Math.round(
            (metricsStats.quality / (totalReviews * 3)) * 100,
          ),
          speed: Math.round((metricsStats.speed / (totalReviews * 3)) * 100),
          packaging: Math.round(
            (metricsStats.packaging / (totalReviews * 3)) * 100,
          ),
        }
      : { quality: 0, speed: 0, packaging: 0 };

  const getMetricIcon = (key) => {
    switch (key) {
      case "quality":
        return <Utensils className="w-4 h-4" />;
      case "speed":
        return <Clock className="w-4 h-4" />;
      case "packaging":
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getMetricLabel = (key) => {
    switch (key) {
      case "quality":
        return "Lezzet/Kalite";
      case "speed":
        return "Hız";
      case "packaging":
        return "Sunum/Paket";
      default:
        return key;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#004aad]">
            Müşteri Deneyimi
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight">
            Düşünceler
          </h1>
          <p className="text-xl text-gray-400 font-medium italic">
            "Müşterilerinizin sesi, işletmenizin pusulasıdır."
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Genel Puan
            </p>
            <p className="text-3xl font-black text-gray-900">
              {averageRating} / 5.0
            </p>
          </div>
          <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-yellow-200">
            <Star className="w-8 h-8 fill-white" />
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#004aad]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Toplam Yorum</p>
            <h3 className="text-3xl font-black text-gray-900">
              {totalReviews}
            </h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">
              %92 Olumlu
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400">Memnuniyet Oranı</p>
            <h3 className="text-3xl font-black text-gray-900">Yüksek</h3>
          </div>
        </div>

        <div className="bg-[#09090b] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-gray-200 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="p-3 bg-white/10 rounded-2xl text-yellow-400 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Cevap Bekleyen
              </p>
              <h3 className="text-4xl font-black">{pendingCount}</h3>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 w-fit">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-400">En Düşük Metrik</p>
            <h3 className="text-xl font-black text-orange-600 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Teslimat Hızı
            </h3>
          </div>
        </div>
      </div>

      {/* AI SUMMARY BOX */}
      <AnimatePresence>
        {isAISummaryOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">AI Müşteri Analizi</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-lg font-medium leading-relaxed text-blue-100">
                    "Son 30 günde müşterileriniz en çok{" "}
                    <span className="text-white font-black underline decoration-yellow-400 underline-offset-4">
                      sos kalitesinden
                    </span>{" "}
                    ve{" "}
                    <span className="text-white font-black underline decoration-yellow-400 underline-offset-4">
                      hijyenden
                    </span>{" "}
                    memnun kaldı. Ancak yoğun saatlerdeki{" "}
                    <span className="text-white font-black underline decoration-red-400 underline-offset-4">
                      teslimat hızı
                    </span>{" "}
                    genel puanınızı %5 aşağı çekiyor."
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/20">
                      #FavoriSos
                    </span>
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/20">
                      #HızlıKuryeİhtiyacı
                    </span>
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/20">
                      #SıcakServis
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4">
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
                    Metrik Ortalamaları
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Lezzet",
                        val: metricsAverage.quality,
                        color: "bg-green-400",
                      },
                      {
                        label: "Hız",
                        val: metricsAverage.speed,
                        color: "bg-orange-400",
                      },
                      {
                        label: "Paketleme",
                        val: metricsAverage.packaging,
                        color: "bg-blue-400",
                      },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-black">
                          <span>{m.label}</span>
                          <span>%{m.val}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
            </div>

            <button
              onClick={() => setIsAISummaryOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex flex-wrap p-1.5 bg-gray-100 rounded-[2rem] w-full lg:w-auto">
          {[
            { id: "all", label: "Tümü", icon: MessageSquare },
            { id: "pending", label: "Bekleyen", icon: Clock },
            { id: "replied", label: "Yanıtlanan", icon: CheckCircle2 },
            { id: "critical", label: "Kritik", icon: AlertCircle },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${filter === f.id ? "bg-white text-[#004aad] shadow-xl" : "text-gray-500 hover:text-gray-800"}`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri adı veya yorum içerisinde ara..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse"
            />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">
            Aradığınız kriterlere uygun yorum bulunamadı.
          </p>
          <button
            onClick={async () => {
              setIsLoading(true);
              await fetch("/api/business/reviews/seed", { method: "POST" });
              await fetchReviews();
            }}
            className="px-8 py-4 bg-white text-[#004aad] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 shadow-sm hover:shadow-md transition-all"
          >
            DEMO YORUMLARI YÜKLE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review) => (
              <motion.div
                layout
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Profile & Initial Info */}
                  <div className="lg:w-64 shrink-0 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gray-100 overflow-hidden relative border-2 border-white shadow-sm font-black flex items-center justify-center text-gray-400 text-xl">
                        <User className="w-8 h-8 opacity-20" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 leading-tight">
                          {review.reviewerName || "Anonim"}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">
                          Müşteri
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 p-3 bg-gray-50 rounded-2xl w-fit">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      {Object.entries(getParsedMetrics(review)).map(
                        ([key, val]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest"
                          >
                            <span className="text-gray-400 flex items-center gap-2">
                              {getMetricIcon(key)} {getMetricLabel(key)}
                            </span>
                            <span
                              className={
                                val === 3
                                  ? "text-green-500"
                                  : val === 2
                                    ? "text-blue-500"
                                    : "text-red-500"
                              }
                            >
                              {val === 3
                                ? "Harika"
                                : val === 2
                                  ? "İyi"
                                  : "Kötü"}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Comment & Actions */}
                  <div className="flex-1 space-y-6">
                    <p className="text-xs font-black text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50">
                      <p className="text-lg text-gray-700 font-medium leading-relaxed italic">
                        "{review.content}"
                      </p>
                    </div>

                    {/* Reply Section */}
                    {review.replyContent ? (
                      <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <Reply className="w-4 h-4 text-[#004aad] -scale-x-100" />
                          <span className="text-xs font-black text-[#004aad] uppercase tracking-widest">
                            Sizin Yanıtınız
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">
                          {review.replyContent}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {!review.isApproved && (
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Onayla
                            </button>
                          )}
                          <button
                            onClick={() => handleReport(review.id)}
                            disabled={!!review.reportedAt}
                            className="flex items-center gap-2 px-6 py-3 text-red-500 rounded-xl font-black text-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Flag className="w-4 h-4" />{" "}
                            {review.reportedAt ? "Bildirildi" : "Bildir"}
                          </button>
                        </div>
                      </div>
                    ) : replyingTo === review.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <textarea
                          autoFocus
                          placeholder="Müşterinize profesyonel ve sıcak bir yanıt yazın..."
                          className="w-full p-6 bg-white border-2 border-blue-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/5 font-medium transition-all"
                          rows="3"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSendReply(review.id)}
                            className="px-8 py-4 bg-[#004aad] text-white rounded-2xl font-black shadow-xl shadow-blue-900/10 hover:bg-black transition-all active:scale-95"
                          >
                            Yanıtı Yayınla
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
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
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Onayla
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                        >
                          <Reply className="w-4 h-4 -scale-x-100" /> Yanıtla
                        </button>
                        <button
                          onClick={() => handleReport(review.id)}
                          disabled={!!review.reportedAt}
                          className="flex items-center gap-2 px-6 py-3 text-red-500 rounded-xl font-black text-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Flag className="w-4 h-4" />{" "}
                          {review.reportedAt ? "Bildirildi" : "Bildir"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER TIPS */}
      <div className="bg-yellow-50/50 p-8 rounded-[3rem] border border-yellow-100/50 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-xl font-black text-yellow-900 mb-1">
            Müşteri Puanını Yükseltme İpucu
          </h4>
          <p className="text-yellow-700 font-medium">
            Olumsuz yorumlara <span className="font-black">ilk 2 saat</span>{" "}
            içinde verdiğiniz nazik yanıtlar, müşterinin yorumunu değiştirme
            olasılığını %40 oranında artırır.
          </p>
        </div>
      </div>
    </div>
  );
}
