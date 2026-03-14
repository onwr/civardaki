"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QuestionMarkCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  TicketIcon,
  LifebuoyIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  IdentificationIcon,
  ArrowRightIcon,
  StarIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("faq");

  const [faqs] = useState([
    {
      id: "1",
      question: "Nasıl yeni müşteri ekleyebilirim?",
      answer: "Müşteriler sayfasına gidin ve 'Yeni Müşteri Ekle' butonuna tıklayın. Gerekli bilgileri doldurun ve kaydedin.",
      category: "CRM",
      views: 245
    },
    {
      id: "2",
      question: "Stok takibi nasıl yapılır?",
      answer: "Ürünler sayfasından stok durumunu görüntüleyebilir, stok girişi/çıkışı yapabilir ve stok uyarıları ayarlayabilirsiniz.",
      category: "Envanter",
      views: 189
    },
    {
      id: "3",
      question: "Rezervasyon nasıl oluşturulur?",
      answer: "Rezervasyon sayfasına gidin, 'Yeni Rezervasyon' butonuna tıklayın. Müşteri bilgilerini ve masa/salon seçimini yapın.",
      category: "Operasyon",
      views: 156
    }
  ]);

  const [guides] = useState([
    {
      id: "1",
      title: "Sistem Kurulum Rehberi",
      description: "Sistemi ilk kez kullanacaklar için detaylı kurulum rehberi",
      difficulty: "Başlangıç",
      estimatedTime: "30 dk",
      views: 456
    },
    {
      id: "2",
      title: "Gelişmiş Raporlama",
      description: "Detaylı raporlar oluşturma ve analiz yapma rehberi",
      difficulty: "İleri",
      estimatedTime: "45 dk",
      views: 234
    }
  ]);

  const stats = {
    faqCount: 42,
    guideCount: 15,
    videoCount: 24,
    openTickets: 3
  };

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE SUPPORT HUB HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <LifebuoyIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Yardım Merkezi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Knowledge Base & Enterprise Support Hub</p>
              </div>
            </div>
          </div>

          <button onClick={() => toast.info("Canlı destek ekibine bağlanılıyor...")} className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <PlusIcon className="w-6 h-6" /> YENİ DESTEK TALEBİ
          </button>
        </div>

        {/* Global Support Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Çözüm Merkezi</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.faqCount} Makale</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Öğrenme Akademisi</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.guideCount} Rehber</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Aktif Talepler</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.openTickets} Adet</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Sistem Durumu</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              <span className="text-xl font-black italic">AKTİF</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED DISCOVERY BAR */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Aradığınız konu, rehber veya işlem adını yazınız..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          {['faq', 'guides', 'videos', 'tickets', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#004aad] text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-[#004aad]'
                }`}
            >
              {tab === 'faq' ? 'SSS' : tab === 'guides' ? 'REHBERLER' : tab === 'videos' ? 'VİDEOLAR' : tab === 'tickets' ? 'TALEPLER' : 'İLETİŞİM'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="mx-2">
        <AnimatePresence mode="wait">
          {activeTab === 'faq' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group flex flex-col md:flex-row items-start gap-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-[1.8rem] flex items-center justify-center shrink-0 group-hover:bg-[#004aad] group-hover:text-white transition-all">
                    <AcademicCapIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-50 text-[#004aad] rounded-lg text-[9px] font-black uppercase tracking-widest">{faq.category}</span>
                      <span className="text-[10px] font-black text-gray-400 italic uppercase">Görüntüleme: {faq.views}</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{faq.question}</h3>
                    <p className="text-sm font-medium text-gray-500 italic leading-relaxed">"{faq.answer}"</p>
                    <button className="text-[10px] font-black text-[#004aad] uppercase tracking-widest hover:underline pt-2">Detaylı Çözümü Gör</button>
                  </div>
                  <ArrowRightIcon className="w-8 h-8 text-gray-100 group-hover:text-[#004aad] group-hover:translate-x-2 transition-all shrink-0 hidden md:block" />
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'guides' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {guides.map((guide) => (
                <div key={guide.id} className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <DocumentTextIcon className="w-8 h-8" />
                    </div>
                    <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${guide.difficulty === 'İleri' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {guide.difficulty}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">{guide.title}</h3>
                    <p className="text-sm font-medium text-gray-400 italic leading-relaxed">{guide.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase italic">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-blue-500" />
                      <span>OKUMA: {guide.estimatedTime}</span>
                    </div>
                    <button className="px-6 py-3 bg-gray-950 text-white rounded-2xl hover:bg-[#004aad] transition-all">REHBERİ AÇ</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { icon: PhoneIcon, title: "ÇÖZÜM MERKEZİ", detail: "+90 212 555 0123", sub: "Pazartesi - Cuma / 09:00 - 18:00", color: "bg-blue-50 text-[#004aad]" },
                { icon: EnvelopeIcon, title: "E-POSTA DESTEK", detail: "destek@civardaki.com", sub: "7/24 Yanıt Garantisi", color: "bg-emerald-50 text-emerald-600" },
                { icon: MapPinIcon, title: "MERKEZ OFİS", detail: "Kadıköy, İstanbul", sub: "Yüz Yüze Eğitim & Destek", color: "bg-amber-50 text-amber-600" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-12 rounded-[5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-center space-y-6">
                  <div className={`w-20 h-20 ${item.color} rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.title}</p>
                    <h4 className="text-2xl font-black text-gray-950 italic tracking-tighter">{item.detail}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight opacity-60">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. AI KNOWLEDGE INTELLIGENCE INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none text-white" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <SparklesIcon className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Destek <span className="text-blue-400">Analizi</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                Kullanım verilerine göre en çok <span className="text-white font-bold">Stok Takibi</span> ve <span className="text-white font-bold">Raporlama</span> modüllerinde takılıyorsunuz. Bu alanlardaki verimliliğinizi %40 artırmak için hazırladığımız <span className="text-blue-400 font-bold">Hızlı Başlangıç Bootcamp</span> serisini izlemenizi öneririm. Sistem kullanım puanınız: <span className="text-emerald-400 font-black">MASTER (%88)</span>
              </p>
            </div>
          </div>
          <button onClick={() => toast.info("Bootcamp eğitimleri yükleniyor...")} className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic shadow-4xl">
            EĞİTİM SERİSİNİ BAŞLAT
          </button>
        </div>
      </motion.div>

    </div>
  );
}
