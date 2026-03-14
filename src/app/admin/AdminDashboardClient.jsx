"use client";

import { motion } from "framer-motion";
import {
    Users,
    Store,
    Activity,
    Clock,
    Globe,
    ArrowRight,
    Store as StoreIcon,
    DollarSign,
    Target
} from "lucide-react";
import Link from "next/link";

const formatDate = (value) => {
    if (!value) return "Tarih yok";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Tarih yok";
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Europe/Istanbul",
    }).format(date);
};

export default function AdminDashboardClient({ metrics, recentBusinesses }) {
    const stats = [
        { label: 'TOPLAM KULLANICI', value: metrics.totalUsers.toLocaleString(), trend: 'Genel', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'KAYITLI İŞLETMELER', value: metrics.totalBusinesses.toLocaleString(), trend: 'Genel', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'ÜRETİLEN LEADS', value: metrics.totalLeads.toLocaleString(), trend: 'Global', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'TOPLAM CİRO (MRR)', value: `₺${metrics.estimatedMRR.toLocaleString()}`, trend: `${metrics.activeSubscriptions} Aktif Üye`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-12">
            {/* 1. HERO / HEADER */}
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 pt-4">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.2)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Süper Admin Kontrol Merkezi</span>
                    </div>
                    <div>
                        <h1 className="text-6xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                            SİSTEM <br /> <span className="text-[#004aad]">DASHBOARD</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
                            Platform genelindeki tüm operasyonları, abonelik durumlarını ve sistem sağlığını bu panelden yönetin.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-blue-200 transition-all shadow-xl shadow-slate-200/50"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform text-[#004aad]"><stat.icon className="w-24 h-24" /></div>
                        <div className="flex items-center justify-between mb-10">
                            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} shadow-inner group-hover:rotate-12 transition-transform`}><stat.icon className="w-8 h-8" /></div>
                            <span className={`text-[10px] font-black ${stat.color} uppercase tracking-[0.2em] italic bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100`}>{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic leading-none">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* 3. MAIN GRID (BENTO) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Recent Registrations */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[4rem] p-10 lg:p-14 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 text-[#004aad]"><Store className="w-60 h-60" /></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">İŞLETME KAYITLARI</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Son 5 İşletme</p>
                                </div>
                                <Link href="/admin/businesses" className="hidden md:flex items-center gap-2 text-[10px] font-black text-[#004aad] uppercase tracking-widest italic hover:translate-x-2 transition-transform">
                                    TÜMÜNÜ GÖR <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {recentBusinesses.map((req) => (
                                    <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group/item">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#004aad] border border-slate-100 group-hover/item:bg-[#004aad] group-hover/item:text-white transition-all shadow-sm">
                                                <StoreIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">{req.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic leading-none">{req.category || "Genel"} &bull; {formatDate(req.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-6 md:mt-0">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic ${req.subscription?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.subscription?.status === 'TRIAL' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'
                                                }`}>
                                                {req.subscription?.status || "YOK"}
                                            </span>
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic ${req.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {req.isActive ? 'AKTİF' : 'PASİF'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-[#004aad] rounded-[4rem] p-10 lg:p-14 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad] to-blue-800" />
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform"><Activity className="w-40 h-40" /></div>
                        <div className="relative z-10 space-y-12">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/10">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-4">SİSTEM ÖZETİ</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Toplam Başarılı Yönlendirme</span>
                                        <div className="text-right">
                                            <p className="text-xl font-black italic tracking-tighter leading-none">{metrics.totalReferrals}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mt-1 italic">Referrals</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Abonelik Getirisi</span>
                                        <div className="text-right">
                                            <p className="text-xl font-black italic tracking-tighter leading-none">₺{metrics.estimatedMRR.toLocaleString()}/ay</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300 mt-1 italic">MRR</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
