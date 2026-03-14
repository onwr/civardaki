"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    ShieldAlert,
    UserRoundCheck,
    History,
    Settings,
    Fingerprint
} from "lucide-react";
import { toast } from "sonner";

function formatDate(value) {
    if (!value) return "-";
    try {
        const d = new Date(value);
        return d.toLocaleString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return "-";
    }
}

export default function AdminGuvenlikPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchSecurityData = async (options = { silent: false }) => {
        const isRefresh = options.silent;
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await fetch("/api/admin/security/overview");
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json.success === false) {
                const baseMessage = json.error || "Güvenlik verileri yüklenemedi.";
                const detailed = ` ${res.status ? `(HTTP ${res.status})` : ""}`.trim();
                throw new Error(`${baseMessage}${detailed ? " " + detailed : ""}`);
            }
            setData(json);
            if (isRefresh) {
                toast.success("Güvenlik verileri güncellendi.");
            }
        } catch (e) {
            const msg = e.message || "Güvenlik verileri yüklenirken bir hata oluştu.";
            console.error(e);
            setError(msg);
            toast.error(msg);
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const summary = data?.summary || {};
    const protocols = data?.protocols || [];
    const accessLogs = data?.accessLogs || [];

    const securityLevelLabel = (() => {
        switch (summary.overallSecurityLevel) {
            case "HIGH":
                return "YÜKSEK";
            case "MEDIUM":
                return "ORTA";
            case "LOW":
                return "DÜŞÜK";
            default:
                return "-";
        }
    })();

    const sslLabel = summary.sslEnabled ? "AKTİF" : "PASİF";

    const kpiCards = [
        {
            label: "AKTİF OTURUMLAR",
            value: typeof summary.activeSessionsCount === "number" ? summary.activeSessionsCount : "-",
            trend: "Anlık",
            icon: UserRoundCheck,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "ENGELLENEN TEHDİT",
            value: typeof summary.blockedThreatsLast24h === "number" ? summary.blockedThreatsLast24h : "-",
            trend: "Son 24s",
            icon: ShieldAlert,
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
        {
            label: "SSL DURUMU",
            value: sslLabel,
            trend: summary.sslEnabled ? "Güvenli" : "Riskli",
            icon: Lock,
            color: summary.sslEnabled ? "text-emerald-600" : "text-amber-600",
            bg: summary.sslEnabled ? "bg-emerald-50" : "bg-amber-50"
        },
        {
            label: "DÜZEY",
            value: securityLevelLabel,
            trend: "Genel Seviye",
            icon: Fingerprint,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];

    const isInitialLoading = loading && !data;

    return (
        <div className="space-y-12">

            {/* 1. BAŞLIK VE ÖZET */}
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-rose-50 rounded-2xl border border-rose-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.2)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-600 italic">SİSTEM GÜVENLİK MERKEZİ</span>
                    </div>
                    <div>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                            GÜVENLİK <br /> <span className="text-[#004aad]">KONTROLÜ</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
                            Platform güvenliğini yönetin, erişim kayıtlarını inceleyin ve kritik güvenlik protokollerini anlık olarak kontrol edin.
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
                            onClick={() => fetchSecurityData({ silent: true })}
                            disabled={refreshing || isInitialLoading}
                            className={`px-10 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-4 italic group ${refreshing || isInitialLoading
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "bg-slate-950 text-white hover:bg-[#004aad]"
                                }`}
                        >
                            <ShieldCheck className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />{" "}
                            {refreshing || isInitialLoading ? "TARAMA YAPILIYOR..." : "TAM TARAMA BAŞLAT"}
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. GÜVENLİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(isInitialLoading ? [1, 2, 3, 4] : kpiCards).map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-[#004aad]/20 transition-all shadow-xl shadow-slate-200/50"
                    >
                        {isInitialLoading ? (
                            <div className="space-y-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-8 animate-pulse" />
                                <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
                                <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse mt-4" />
                            </div>
                        ) : (
                            <>
                                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-8 shadow-inner`}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic leading-none">{item.label}</p>
                                <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none">{item.value}</h3>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${item.color}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${item.color} italic`}>{item.trend}</span>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* 3. KRİTİK AYARLAR VE LOGLAR */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Güvenlik Protokolleri */}
                <div className="xl:col-span-12">
                    <div className="bg-white border border-slate-100 rounded-[4rem] p-10 lg:p-14 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">AKTİF GÜVENLİK PROTOKOLLERİ</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Sistemi Korumaya Yönelik Kurallar</p>
                            </div>
                            <Settings className="w-10 h-10 text-slate-100" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {isInitialLoading && (
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                            <div className="h-4 w-40 bg-slate-100 rounded-full mb-3 animate-pulse" />
                                            <div className="h-3 w-64 bg-slate-100 rounded-full mb-2 animate-pulse" />
                                            <div className="h-3 w-52 bg-slate-100 rounded-full animate-pulse" />
                                        </div>
                                    ))}
                                </>
                            )}
                            {!isInitialLoading && protocols.map((item) => (
                                <div key={item.key} className="flex items-start justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-[#004aad]/20 transition-all group">
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-slate-950 italic uppercase tracking-tighter">{item.title}</h4>
                                        <p className="text-xs font-bold text-slate-400 italic leading-relaxed max-w-sm">{item.description}</p>
                                    </div>
                                    <div className={`w-14 h-8 rounded-full p-1 cursor-default transition-colors ${item.enabled ? 'bg-[#004aad]' : 'bg-slate-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                            {!isInitialLoading && protocols.length === 0 && (
                                <div className="col-span-full text-xs font-bold text-slate-400 italic">
                                    Aktif güvenlik protokolü bilgisi bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Erişim Kayıtları */}
                <div className="xl:col-span-12">
                    <div className="bg-white border border-slate-100 rounded-[4rem] p-10 lg:p-14 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 bg-slate-950 rounded-[1.8rem] flex items-center justify-center text-white">
                                <History className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">ERİŞİM KAYITLARI</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Son Güvenlik Olayları ve Giriş Hareketleri</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">OLAY</th>
                                        <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">KULLANICI</th>
                                        <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">TARİH</th>
                                        <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">IP ADRESİ</th>
                                        <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">DURUM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isInitialLoading && (
                                        <>
                                            {[1, 2, 3].map((i) => (
                                                <tr key={i} className="group">
                                                    <td className="py-6">
                                                        <div className="h-3 w-40 bg-slate-100 rounded-full animate-pulse" />
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="h-3 w-28 bg-slate-100 rounded-full animate-pulse" />
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <div className="h-6 w-20 bg-slate-100 rounded-full inline-block animate-pulse" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {!isInitialLoading && accessLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="py-8 font-black text-slate-950 italic uppercase tracking-tighter">{log.eventType}</td>
                                            <td className="py-8 text-sm font-bold text-slate-600">{log.userName}</td>
                                            <td className="py-8 text-sm font-bold text-slate-400">{formatDate(log.createdAt)}</td>
                                            <td className="py-8 font-mono text-xs text-slate-400">{log.ip || "-"}</td>
                                            <td className="py-8 text-right">
                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic ${String(log.status || "").toUpperCase().includes("ERROR") || String(log.status || "").toUpperCase().includes("BLOCK")
                                                    ? "bg-rose-50 text-rose-600"
                                                    : "bg-emerald-50 text-emerald-600"
                                                    }`}>{log.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isInitialLoading && accessLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 italic">
                                                Son 24 saat içinde kaydedilmiş güvenlik olayı bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
