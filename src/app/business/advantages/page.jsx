"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GiftIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  GlobeAltIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function AdvantagesPage() {
  const [advantages] = useState([
    {
      id: "1",
      name: "Elite Üyelik",
      description: "Tüm platform özelliklerine sınırsız ve öncelikli erişim",
      status: "ACTIVE",
      expiryDate: "2025-12-31",
      icon: TrophyIcon,
      color: "blue",
      benefits: ["Sınırsız Şube", "Özel Dashboard", "Yapay Zeka Destekli Analiz"]
    },
    {
      id: "2",
      name: "7/24 VIP Destek",
      description: "Özel müşteri temsilcisi ve anlık Teknik destek hattı",
      status: "ACTIVE",
      expiryDate: "2025-12-31",
      icon: SparklesIcon,
      color: "emerald",
      benefits: ["< 15 dk Yanıt Süresi", "Video Konferans Desteği", "Yerinde Eğitim"]
    },
    {
      id: "3",
      name: "Gelişmiş Analitik",
      description: "Derinlemesine pazar payı ve müşteri davranışı raporlama",
      status: "ACTIVE",
      expiryDate: "2025-12-31",
      icon: ChartBarIcon,
      color: "purple",
      benefits: ["Tahminleme Modülü", "Rakip Analizi", "Sektörel Benchmark"]
    },
    {
      id: "4",
      name: "Enterprise API",
      description: "Kendi yazılımlarınızla tam entegrasyon için SDK ve API",
      status: "PENDING",
      expiryDate: null,
      icon: RocketLaunchIcon,
      color: "amber",
      benefits: ["JSON REST API", "Webhooks", "Custom Endpoints"]
    }
  ]);

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE ADVANTAGES HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-950 rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-4xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <TrophyIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-[#004aad] flex items-center justify-center shadow-2xl">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Elite Ayrıcalıkları</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Enterprise Benefits & Privilege Center</p>
              </div>
            </div>
            <p className="text-gray-400 font-medium max-w-xl italic">
              "İşletmeniz için tanımlanan özel haklar ve ayrıcalıklarla ekosistemin gücünü hissedin."
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-md">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">MEMNUNİYET SKORU</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black italic">4.9 / 5.0</span>
                <StarIcon className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Advantage Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Aktif Avantaj</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">3 Adet</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Yıllık Tasarruf</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">12.5k₺ +</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Destek Hattı</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-white tracking-tighter italic">VIP</span>
              <BoltIcon className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Sistem Seviyesi</p>
            <span className="text-4xl font-black text-[#00ffcc] tracking-tighter italic">ELITE</span>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANTAGES BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 mx-2">
        <AnimatePresence>
          {advantages.map((adv, idx) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[4.5rem] border border-gray-100 shadow-2xl p-12 transition-all group relative overflow-hidden flex flex-col lg:flex-row gap-10"
            >
              <div className={`absolute top-0 right-0 w-48 h-48 opacity-5 rounded-full blur-3xl -mr-24 -mt-24 bg-${adv.color}-500/30 group-hover:bg-${adv.color}-500/50 transition-colors`} />

              <div className="w-32 h-32 rounded-[3.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-inner shrink-0 text-gray-900">
                <adv.icon className="w-14 h-14" />
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${adv.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {adv.status === 'ACTIVE' ? 'AKTİF HAK' : 'BEKLEMEDE'}
                    </span>
                    <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic leading-none mt-3">{adv.name}</h3>
                  </div>
                  {adv.expiryDate && (
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">GEÇERLİLİK</p>
                      <p className="text-sm font-black text-gray-950 italic">{adv.expiryDate}</p>
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-400 italic leading-relaxed">"{adv.description}"</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-4">
                  {adv.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-8 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRightIcon className="w-8 h-8 text-[#004aad]" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. FUTURE UNLOCKS (Coming Soon) */}
      <div className="bg-gray-50 rounded-[4rem] p-12 border border-gray-100 mx-2">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <RocketLaunchIcon className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-gray-900">Yakında Açılacaklar</h3>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Elite Roadmap & Feature Pipeline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Bölgesel Isı Haritası", desc: "Müşterilerinizin yoğunlaştığı bölgeleri anlık takip edin.", icon: GlobeAltIcon },
            { title: "Smart Chatbot", desc: "VIP müşterileriniz için 7/24 otomatik karşılama asistanı.", icon: WrenchScrewdriverIcon },
            { title: "Fulfillment Entegrasyonu", desc: "Global depo ağları ile doğrudan sipariş yönetimi.", icon: ShieldCheckIcon }
          ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
              <f.icon className="w-10 h-10 text-gray-300 mb-6" />
              <h4 className="text-lg font-black text-gray-900 uppercase leading-none mb-2">{f.title}</h4>
              <p className="text-xs font-medium text-gray-400 leading-relaxed italic">"{f.desc}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI STRATEGIC GROWTH WIDGET */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-[#004aad] to-[#01142f] rounded-[4.5rem] p-14 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl group-hover:scale-110 transition-transform duration-1000">
          <ChartBarIcon className="w-96 h-96 text-white" />
        </div>
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-white/10 rounded-[3rem] flex items-center justify-center border border-white/10 shadow-4xl backdrop-blur-md">
              <SparklesIcon className="w-12 h-12 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Stratejik <span className="text-blue-400">Büyüme</span> Öngörüsü</h3>
              <p className="text-blue-100/70 italic max-w-2xl text-lg leading-relaxed">
                "Sistem verileriniz, mevcut avantajlarınızı kullanmanız durumunda gelecek yıl için <span className="text-white font-bold">%42 büyüme</span> potansiyeli gösteriyor. Özellikle <span className="text-blue-400 font-bold">Gelişmiş Analitik</span> verilerini haftalık rapora dökmeniz pazar avantajınızı koruyacaktır."
              </p>
            </div>
          </div>
          <button onClick={() => toast.success("Büyüme raporu oluşturuluyor...")} className="px-14 py-7 bg-white text-gray-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic shadow-4xl active:scale-95">
            BÜYÜME RAPORU AL
          </button>
        </div>
      </motion.div>

    </div>
  );
}
