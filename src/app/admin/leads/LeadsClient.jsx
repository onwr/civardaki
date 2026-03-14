"use client";

import { useState } from "react";
import { ShieldAlert, Search, MessageSquare, ExternalLink, Filter, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function LeadsClient({ initialLeads }) {
    const [leads, setLeads] = useState(initialLeads);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL"); // ALL, SUSPICIOUS, CLEAN

    const filteredLeads = leads.filter(l => {
        const matchesSearch =
            (l.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.business?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.message || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filter === "ALL" ||
            (filter === "SUSPICIOUS" && l.isSuspicious) ||
            (filter === "CLEAN" && !l.isSuspicious);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-rose-100">
                        <ShieldAlert className="w-3.5 h-3.5" /> Anti-Spam Koruması
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        MÜŞTERİ <br /><span className="text-rose-600">TALEPLERİ</span>
                    </h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 border border-slate-200 focus-within:border-rose-500/30 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-rose-900/5 transition-all rounded-2xl w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ad, işletme veya mesaj ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-black italic text-slate-950 placeholder:text-slate-400 w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    {[
                        { id: "ALL", label: "Tümü" },
                        { id: "SUSPICIOUS", label: "Şüpheli / Spam" },
                        { id: "CLEAN", label: "Güvenli" }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f.id ? 'bg-slate-950 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic">İşletme / Tarih</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic">Müşteri</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic">İçerik</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic text-center">Spam?</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLeads.map((l) => (
                                <tr key={l.id} className={`hover:bg-slate-50/50 transition-colors group ${l.isSuspicious ? 'bg-rose-50/20' : ''}`}>
                                    <td className="p-6">
                                        <div className="font-black text-slate-900 text-sm tracking-tight mb-1">
                                            {l.business?.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {format(new Date(l.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-slate-900 text-sm italic">{l.name}</div>
                                        <div className="text-[10px] text-slate-500 font-bold leading-tight mt-1">
                                            {l.phone && <div>📞 {l.phone}</div>}
                                            {l.email && <div>✉️ {l.email}</div>}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="max-w-xs">
                                            {l.product && (
                                                <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded-md mb-2 uppercase tracking-widest border border-blue-100">
                                                    Ürün: {l.product.name}
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2" title={l.message}>
                                                "{l.message}"
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        {l.isSuspicious ? (
                                            <div className="inline-flex flex-col items-center gap-1">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">
                                                    <ShieldAlert className="w-3 h-3" /> ŞÜPHELİ
                                                </span>
                                                {l.spamReason && (
                                                    <span className="text-[8px] text-rose-500 font-bold uppercase max-w-[120px] truncate" title={l.spamReason}>
                                                        {l.spamReason}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                                                <ShieldCheck className="w-3 h-3" /> TEMİZ
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <Link
                                            href={`/business/${l.business?.slug}`}
                                            target="_blank"
                                            className="inline-flex items-center justify-center p-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic text-sm">
                                        Sorguya uygun talep bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
