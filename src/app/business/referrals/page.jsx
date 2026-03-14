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
  CheckCircle,
  ArrowRight,
  Sparkles,
  Loader2,
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

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [business, setBusiness] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/business/dashboard-summary", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Veriler alınamadı.");
        if (!cancelled) {
          setBusiness(data.business || null);
          setMetrics(data.metrics || null);
        }
      } catch (e) {
        if (!cancelled) toast.error(e.message || "Referans verileri alınamadı.");
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
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/r/${code}`;
    }
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";
    return `${base}/r/${code}`;
  }, [business?.referralCode]);

  const referralStats = metrics?.referralStats || { totalInvited: 0, totalActive: 0 };
  const referralHistory = Array.isArray(metrics?.referralHistory) ? metrics.referralHistory : [];

  const handleCopy = async () => {
    if (!referralLink) {
      toast.error("Önce referans kodunuz oluşmalı.");
      return;
    }
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referans linki kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalama başarısız. Tarayıcı iznini kontrol edin.");
    }
  };

  const handleShareWhatsApp = () => {
    if (!referralLink) return;
    const text = `Civardaki.com'a davetlisin. Bu link ile kaydol: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
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
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 font-inter antialiased text-left relative">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-900 rounded-2xl border border-purple-800">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
              Ortaklık Programı
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
            PAYLAŞ VE <br /> <span className="text-purple-600">KAZAN</span>
          </h1>
          <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 max-w-2xl">
            Referans linkinizi paylaşın, sisteme katılan işletmelerden kazanç elde edin.
          </p>
        </div>

        <div className="p-1 px-4 bg-purple-50 border border-purple-100 rounded-[2rem] flex items-center gap-4">
          <div className="text-right py-4">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
              AKTİF REFERANS
            </p>
            <p className="text-3xl font-black text-slate-950 italic">
              {referralStats.totalActive} İŞLETME
            </p>
          </div>
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <Gift className="w-7 h-7" />
          </div>
        </div>
      </section>

      <div className="bg-slate-950 rounded-[3.5rem] p-10 lg:p-16 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-110 transition-transform duration-1000 origin-top-right">
          <Share2 className="w-60 h-60 text-white" />
        </div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter leading-none mb-4">
                DAVET BAĞLANTINIZ
              </h2>
              <p className="text-slate-400 font-bold italic text-sm leading-relaxed max-w-md">
                Bu özel bağlantıyı işletme sahipleriyle paylaşın. Kayıt olduklarında sistem sizi referans sahibi
                olarak tanır.
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 pr-2 pl-6">
              <code className="flex-1 text-purple-300 font-mono text-sm tracking-tight truncate">
                {referralLink || "Referans linki hazırlanıyor..."}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-xl active:scale-95"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "KOPYALANDI" : "KOPYALA"}
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-6 py-3 rounded-xl bg-[#25D366] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-900/20"
              >
                WhatsApp ile Gönder
              </button>
              <button
                type="button"
                onClick={handleShareTwitter}
                className="px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#1a91da] transition-colors shadow-lg shadow-blue-900/20"
              >
                Twitter'da Paylaş
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 space-y-5">
            <StatRow title="Toplam Davet" value={referralStats.totalInvited} icon={Users} />
            <StatRow title="Aktif Dönüşüm" value={referralStats.totalActive} icon={TrendingUp} />
            <StatRow title="Referans Kodu" value={business?.referralCode || "-"} icon={Gift} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">DAVET GEÇMİŞİ</h3>
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
            Son {referralHistory.length} kayıt
          </span>
        </div>

        {referralHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-500 font-semibold">
            Henüz referans geçmişiniz bulunmuyor.
          </div>
        ) : (
          <div className="space-y-4">
            {referralHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-purple-200 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 shadow-sm text-lg italic">
                    {String(item.invitedBizName || "B").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-slate-950 uppercase italic text-sm">{item.invitedBizName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-1 ${
                      item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status === "ACTIVE" ? "Onaylandı" : "Beklemede"}
                  </span>
                  {item.reward ? (
                    <p className="text-xs font-black text-purple-600 italic flex items-center justify-end gap-1">
                      <Gift className="w-3 h-3" /> {item.reward}
                    </p>
                  ) : (
                    <p className="text-xs font-black text-slate-400 italic">-</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-[3.5rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
            <Sparkles className="w-3 h-3 text-white" /> Pro Üyelik
          </div>
          <h3 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none">
            FENOMEN MİSİNİZ? <br />
            <span className="text-slate-900">GELİR ORTAĞIMIZ OLUN!</span>
          </h3>
          <p className="font-bold text-white/90 text-sm italic leading-relaxed">
            Geniş kitleniz varsa gelir ortaklığı programına başvurabilirsiniz.
          </p>
        </div>

        <Link
          href="/business/tickets"
          className="relative z-10 px-10 py-5 bg-white text-orange-600 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-950 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3"
        >
          BAŞVURU OLUŞTUR <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function StatRow({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-white italic mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
        <Icon className="w-5 h-5 text-purple-300" />
      </div>
    </div>
  );
}
