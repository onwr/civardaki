"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    AlertTriangle,
    HardDrive,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ChevronRight,
    Search
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function SystemClient() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/admin/system");
            const json = await res.json();
            if (json.ok) setData(json);
        } catch (error) {
            console.error("Failed to fetch system data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    const { heartbeats = [], errors = [], disk = {}, stats = {} } = data || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight italic">
                        Sistem <span className="text-blue-600">İzleme</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm uppercase tracking-widest">
                        Donanım, Worker ve Hata Takibi
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                    <RotateCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Veriyi Yenile
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Disk Usage */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <HardDrive className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disk Kullanımı</p>
                            <h3 className="text-lg font-black text-slate-950">{disk.sizeHuman}</h3>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${disk.sizeBytes > 1024 * 1024 * 500 ? "bg-rose-500" : "bg-blue-600"
                                }`}
                            style={{ width: `${Math.min(100, (disk.sizeBytes / (1024 * 1024 * 1000)) * 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                        {disk.fileCount} Toplam Dosya (Uploads)
                    </p>
                </div>

                {/* Active Sockets - Placeholder for now */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Bağlantı</p>
                            <h3 className="text-lg font-black text-slate-950">Canlı</h3>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-600">Online</span>
                        <span className="text-xs font-bold text-slate-400">WebSocket</span>
                    </div>
                </div>

                {/* Businesses Summary */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bekleyen Onay</p>
                            <h3 className="text-lg font-black text-slate-950">{stats.pendingReviews}</h3>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Toplam İşletme:</span>
                        <span className="text-sm font-black text-slate-950">{stats.activeBusinesses}</span>
                    </div>
                </div>

                {/* Health Score */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Hata</p>
                            <h3 className="text-lg font-black text-slate-950">{errors.length}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${errors.length > 0 ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                            {errors.length > 3 ? "Kritik İnceleme Lazım" : "Normal Seviye"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Worker Status (Left) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Worker Sağlık Durumu
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {heartbeats.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase italic">
                                    Henüz heartbeat logu yok
                                </div>
                            ) : (
                                heartbeats.map((hb) => (
                                    <div key={hb.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-10 rounded-full ${hb.value === "OK" ? "bg-emerald-500" :
                                                    hb.value === "RUNNING" ? "bg-blue-500" : "bg-rose-500"
                                                }`}></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{hb.key.replace("worker:", " ").trim()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    Son Çalışma: {format(new Date(hb.lastHeartbeat), "d MMMM HH:mm", { locale: tr })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${hb.value === "OK" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                hb.value === "RUNNING" ? "bg-blue-50 border-blue-100 text-blue-700 animate-pulse" :
                                                    "bg-rose-50 border-rose-100 text-rose-700"
                                            }`}>
                                            {hb.value}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Log (Right) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                Son Sistem Hataları
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit: Son 10</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {errors.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tertemiz! Hata bulunamadı.</p>
                                </div>
                            ) : (
                                errors.map((err) => (
                                    <div key={err.id} className="p-6 hover:bg-rose-50/30 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[9px] font-black uppercase">
                                                        {err.service}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {format(new Date(err.createdAt), "HH:mm:ss", { locale: tr })}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                                                    {err.message}
                                                </h3>
                                                {err.stack && (
                                                    <pre className="mt-4 p-3 bg-slate-900 text-slate-400 text-[10px] rounded-xl overflow-x-auto max-h-32 scrollbar-thin">
                                                        {err.stack.split("\n").slice(0, 3).join("\n")}...
                                                    </pre>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-rose-400" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
