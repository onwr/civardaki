"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Database,
    Server,
    Cpu,
    HardDrive,
    Network,
    ShieldCheck,
    Cloud,
    Code2,
    Terminal,
    RefreshCw,
    Zap,
    Activity
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminInfrastructurePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/infrastructure/overview");
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.ok) {
                setData(json);
            } else {
                setError(json?.error || "Sistem verileri alınamadı.");
            }
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const db = data?.db || null;
    const counts = data?.counts || {};
    const storage = data?.storage || {};
    const system = data?.system || {};
    const errors = system.errors || [];

    const cpuItems = [
        {
            label: "Platform CPU",
            value: "—",
            percent: 0
        },
        {
            label: "Disk Kullanımı",
            value: storage.sizeHuman || "0 MB",
            percent: typeof storage.usagePercent === "number" ? storage.usagePercent : 0
        },
        {
            label: "Upload Dosya Sayısı",
            value: `${storage.fileCount || 0} dosya`,
            percent: 0
        }
    ];

    const inboundLabel = typeof counts.ordersLast24h === "number" ? `${counts.ordersLast24h} sipariş` : "0 sipariş";
    const outboundLabel =
        typeof counts.revenueLast24h === "number"
            ? `₺${counts.revenueLast24h.toLocaleString("tr-TR")}`
            : "₺0";
    const cdnStatus = storage.sizeBytes != null ? "Aktif" : "Bilinmiyor";

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    return (
        <div className="space-y-16">

            {/* 1. HERO HEADER */}
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.2)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Sistem Altyapı & DevSecOps</span>
                    </div>
                    <div>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                            ALTYAPI <br /> <span className="text-[#004aad]">MİMARİSİ</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
                            Platformun can damarı olan sunucu, veritabanı ve API katmanlarını gerçek zamanlı olarak izleyin ve optimize edin.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {error && (
                        <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-[0.18em] max-w-xs text-right">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="px-10 py-6 bg-white border border-slate-200 text-slate-950 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl flex items-center gap-4 italic group disabled:opacity-60"
                        >
                            <RefreshCw className={`w-5 h-5 transition-transform duration-700 ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`} /> SİSTEMİ TARA
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. INFRASTRUCTURE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Real-time Server Load */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white border border-slate-100 rounded-[4rem] p-10 lg:p-14 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 bg-[#004aad] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/10">
                                <Server className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">VERİ TABANI DURUMU</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Bağlantı & Versiyon Özeti</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {!db ? (
                                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-dashed border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] italic text-center">
                                    Veritabanı bilgisi alınamadı.
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                                                {db.engine} {db.version || ""}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
                                                Bağlantı: {db.connectionStatus}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        {db.now && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">
                                                    Sunucu Saati
                                                </p>
                                                <p className="text-xs font-black text-slate-900 italic">
                                                    {format(new Date(db.now), "d MMMM yyyy HH:mm:ss", { locale: tr })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[4rem] p-12 relative overflow-hidden group shadow-2xl">
                        <div className="flex items-center gap-8 mb-10 text-white">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.8rem] flex items-center justify-center text-blue-400 shadow-inner">
                                <Terminal className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">SON LOGLAR</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Real-time Runtime Logs</p>
                            </div>
                        </div>
                        <div className="bg-black/50 rounded-3xl p-8 font-mono text-[11px] space-y-3 border border-white/5 max-h-72 overflow-y-auto">
                            {errors.length === 0 ? (
                                <p className="text-slate-500 text-center">
                                    Son dönemde gösterilecek hata/log kaydı bulunamadı.
                                </p>
                            ) : (
                                errors.map((log) => (
                                    <p key={log.id} className="text-slate-200">
                                        <span className="text-slate-700">
                                            [{format(new Date(log.createdAt), "HH:mm:ss", { locale: tr })}]
                                        </span>{" "}
                                        <span className="text-emerald-400 font-semibold">
                                            {log.service?.toUpperCase() || "LOG"}
                                        </span>
                                        {": "}
                                        {log.message}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Details */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#004aad] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700 rotate-12"><Cpu className="w-40 h-40" /></div>
                        <div className="relative z-10 space-y-12">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">CPU & BELLEK</h3>
                            <div className="space-y-8">
                                {cpuItems.map((item, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">
                                                {item.label}
                                            </span>
                                            <span className="text-xl font-black italic tracking-tighter">
                                                {item.value}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                                                className="h-full bg-white shadow-[0_0_15px_white]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[4rem] p-12 relative overflow-hidden group shadow-xl">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#004aad]">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">AĞ HACMİ</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Inbound</span>
                                <span className="text-lg font-black text-emerald-600 italic">{inboundLabel}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Outbound</span>
                                <span className="text-lg font-black text-[#004aad] italic">{outboundLabel}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Global CDN</span>
                                <span className="text-lg font-black text-slate-950 italic">
                                    {cdnStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
