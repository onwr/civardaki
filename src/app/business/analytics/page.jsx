"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    MapPin,
    Phone,
    Eye,
    MousePointerClick,
    Share2,
    Heart,
    ArrowUp,
    ArrowDown,
    Calendar,
    Filter,
    Users,
    Clock,
    Globe,
    Smartphone,
    ChevronRight,
    Target,
    Star
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("hafta");
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/business/analytics?range=${timeRange}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const kpis = [
        {
            id: 'views',
            label: 'PROFİL GÖRÜNTÜLENME',
            value: data?.kpis?.views || 0,
            trend: '+0%',
            trendUp: true,
            icon: Eye,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            desc: 'İşletme profilinizin toplam görüntülenme sayısı.'
        },
        {
            id: 'directions',
            label: 'YOL TARİFİ ALINDI',
            value: data?.kpis?.directions || 0,
            trend: '+0%',
            trendUp: true,
            icon: MapPin,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            desc: 'Harita üzerinden konumunuza yol tarifi başlatanlar.'
        },
        {
            id: 'calls',
            label: 'TELEFON ARAMASI',
            value: data?.kpis?.calls || 0,
            trend: '+0%',
            trendUp: true,
            icon: Phone,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            desc: 'Profilinizdeki "Ara" butonuna tıklayanlar.'
        },
        {
            id: 'revenue',
            label: 'GELİR ANALİZİ',
            value: `${(data?.kpis?.revenue || 0).toLocaleString()} ₺`,
            trend: '+0%',
            trendUp: true,
            icon: TrendingUp,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            desc: 'Belirli aralıkta tamamlanan toplam satış tutarı.'
        },
        {
            id: 'conversion',
            label: 'DÖNÜŞÜM ORANI',
            value: `%${data?.kpis?.conversionRate ?? 0}`,
            trend: '',
            trendUp: true,
            icon: Target,
            color: 'text-teal-500',
            bg: 'bg-teal-50',
            desc: 'Ziyaret edenlerden talep oluşturanların oranı (ziyaret → talep).'
        }
    ];

    return (
        <div className="space-y-12 pb-20 font-inter antialiased text-left relative">

            {/* 1. HEADER SECTION */}
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Canlı Veri</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                        ETKİLEŞİM <br /> <span className="text-[#004aad]">ANALİTİĞİ</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 max-w-2xl">
                        Müşterilerinizin işletmenizle nasıl etkileşime geçtiğini, hangi kanallardan geldiğini ve davranış alışkanlıklarını analiz edin.
                    </p>
                </div>

                <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl">
                    {['gün', 'hafta', 'ay', 'yıl'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-[#004aad] text-white shadow-lg' : 'text-slate-400 hover:text-slate-950'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </section>

            {/* 2. KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4, 5].map(i => <div key={i} className="h-48 bg-gray-50 rounded-[3rem] animate-pulse" />)
                ) : (
                    kpis.map((kpi) => (
                        <motion.div
                            key={kpi.id}
                            whileHover={{ y: -5 }}
                            className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-14 h-14 ${kpi.bg} rounded-2xl flex items-center justify-center ${kpi.color} shadow-inner group-hover:scale-110 transition-transform`}>
                                    <kpi.icon className="w-7 h-7" />
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-50 border ${kpi.trendUp ? 'text-emerald-500 border-emerald-100' : 'text-rose-500 border-rose-100'}`}>
                                    {kpi.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {kpi.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                            <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none mb-4">{kpi.value}</h3>
                        </motion.div>
                    ))
                )}
            </div>

            {/* 3. MAIN CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Interaction Trends (8 Col) */}
                <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-10 lg:p-14 border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-[#004aad] rounded-2xl flex items-center justify-center shadow-inner"><BarChart3 className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">ETKİLEŞİM ANALİZİ</h3>
                                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Haftalık görüntülenme ve tıklama performansı</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#004aad]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Görüntülenme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yol Tarifi</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full relative z-10">
                        {isLoading ? (
                            <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.interactionData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#004aad" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#004aad" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 800, fontSize: '13px' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#004aad" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 8, strokeWidth: 0 }} />
                                    <Area type="monotone" dataKey="directions" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorDir)" activeDot={{ r: 8, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* RIGHT: Source Distribution (4 Col) */}
                <div className="lg:col-span-4 bg-slate-950 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10"><Globe className="w-40 h-40 text-white" /></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">TRAFİK KAYNAĞI</h3>
                            <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Müşterileriniz sizi nereden buluyor?</p>
                        </div>

                        <div className="h-[300px] w-full flex items-center justify-center relative mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.sourceData || []}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(data?.sourceData || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
                                <p className="text-3xl font-black text-white italic">{data?.sourceData?.[0]?.value || 0}%</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Arama</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-4">
                            {(data?.sourceData || []).map((source) => (
                                <div key={source.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{source.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-white italic">%{source.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ACTIVITY HEATMAP & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Heatmap Card */}
                <div className="bg-white rounded-[3.5rem] p-10 lg:p-12 border border-slate-100 shadow-xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner"><Clock className="w-6 h-6 animate-pulse" /></div>
                        <div>
                            <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">EN YOĞUN SAATLER</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Müşteri etkileşimlerinin zaman dağılımı</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.timeHeatmap || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                    {(data?.timeHeatmap || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value > 8 ? '#fbbf24' : '#fcd34d'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <Target className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                            "Yoğunluk genellikle <span className="font-black">20:00 - 22:00</span> arasında zirve yapıyor. Bu saatlerde 'Flash İndirim' bildirimleri göndermek etkileşimi %40 artırabilir."
                        </p>
                    </div>
                </div>

                {/* Insight & Action Card */}
                <div className="bg-gradient-to-br from-[#004aad] to-blue-700 rounded-[3.5rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-12 opacity-10"><Target className="w-52 h-52 text-white rotate-12" /></div>

                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Yapay Zeka Önerisi
                        </div>

                        <div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-3">Dönüşüm oranı <br /> <span className="text-blue-200">%{data?.kpis?.conversionRate ?? 0}</span></h3>
                            <p className="text-sm font-bold text-blue-100/80 leading-relaxed max-w-sm">
                                Seçili dönemde profilinizi ziyaret edenlerden talep (lead) oluşturanların oranı. Ziyaret sayısı ve talepleri artırmak bu oranı iyileştirir.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
                                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">ARAMA BAŞINA MALİYET</p>
                                <p className="text-xl font-black italic">0.00 TL</p>
                            </div>
                            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
                                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">RAKİP ANALİZİ</p>
                                <p className="text-xl font-black italic">Lider</p>
                            </div>
                        </div>
                    </div>

                    <button className="relative z-10 w-full py-5 bg-white text-[#004aad] rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-xl mt-8 flex items-center justify-center gap-3 active:scale-95">
                        Detaylı Rapor İndir <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
}
