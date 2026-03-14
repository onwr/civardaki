"use client";

import { motion } from "framer-motion";
import {
    BriefcaseIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ArrowRightIcon,
    SparklesIcon,
    ShieldCheckIcon,
    BoltIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function HRDashboard() {
    const hrModules = [
        {
            title: "Maaş Yönetimi",
            description: "Personel hakedişleri, bordro süreçleri ve vergi yükü analizi.",
            icon: BanknotesIcon,
            href: "/business/hr/payroll",
            color: "bg-blue-500",
            stats: "₺442k Toplam"
        },
        {
            title: "İzin Yönetimi",
            description: "Yıllık izinler, hastalık raporları ve personel devamlılık takibi.",
            icon: CalendarDaysIcon,
            href: "/business/hr/leaves",
            color: "bg-emerald-500",
            stats: "12 Bekleyen"
        },
        {
            title: "Performans",
            description: "KPI takibi, yetkinlik matrisi ve gelişim değerlendirmeleri.",
            icon: ChartBarIcon,
            href: "/business/hr/performance",
            color: "bg-amber-500",
            stats: "8.4 Ort. Skor"
        },
        {
            title: "Eğitim & Gelişim",
            description: "Kurumsal eğitim planları, sertifikalar ve gelişim akademisi.",
            icon: AcademicCapIcon,
            href: "/business/hr/training",
            color: "bg-purple-500",
            stats: "3 Aktif Program"
        }
    ];

    return (
        <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

            {/* 1. HR COMMAND CENTER HERO */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
                    <BriefcaseIcon className="w-96 h-96 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                                <UserGroupIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">İnsan Kaynakları</h1>
                                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Intelligence-Driven Personnel Architecture</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-8 py-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">PERSONEL GÜCÜ</p>
                            <p className="text-2xl font-black italic">42 Aktif</p>
                        </div>
                        <div className="px-8 py-6 bg-emerald-500 rounded-[2.5rem] text-center shadow-xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-1">SİSTEM SAĞLIĞI</p>
                            <p className="text-2xl font-black italic">%98</p>
                        </div>
                    </div>
                </div>

                {/* Global HR Insights Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10 text-left">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Aylık Maliyet</p>
                        <span className="text-4xl font-black text-white tracking-tighter italic">₺442k</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Verimlilik Skoru</p>
                        <span className="text-4xl font-black text-white tracking-tighter italic">8.8/10</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Turnover Oranı</p>
                        <span className="text-4xl font-black text-white tracking-tighter italic">%2.4</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Sertifikasyon</p>
                        <span className="text-4xl font-black text-white tracking-tighter italic">%100</span>
                    </div>
                </div>
            </motion.div>

            {/* 2. MODULE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-2">
                {hrModules.map((module, idx) => (
                    <Link key={module.href} href={module.href}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden h-full flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-blue-50 transition-colors" />

                            <div className="space-y-8 relative z-10">
                                <div className={`w-20 h-20 rounded-[2.5rem] ${module.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                                    <module.icon className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{module.title}</h3>
                                    <p className="text-sm font-medium text-gray-400 italic mt-4 leading-relaxed line-clamp-2">"{module.description}"</p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">GÜNCEL DURUM</p>
                                    <p className="text-xl font-black text-gray-950 italic tracking-tighter">{module.stats}</p>
                                </div>
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#004aad] transition-all">
                                    <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* 3. AI STRATEGIC PERSONNEL INSIGHT */}
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
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Stratejik <span className="text-blue-400">Danışman</span></h3>
                            <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                                Personel devir hızınız (turnover) son 3 ayda <span className="text-white font-bold">%1.5 iyileşti.</span> Eğitim modülündeki katılımın artması, çalışan bağlılığını doğrudan %18 rampa etti. Yeni dönemde <span className="text-blue-400 font-bold">Esnek Çalışma</span> modelini belirli departmanlarda test etmenizi öneririm.
                            </p>
                        </div>
                    </div>
                    <button className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic shadow-4xl">
                        İK STRATEJİ RAPORU
                    </button>
                </div>
            </motion.div>

        </div>
    );
}
