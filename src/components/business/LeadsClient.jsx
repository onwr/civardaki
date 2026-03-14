"use client";

import { useState, useEffect } from "react";
import {
    Search, Filter, MessageSquare, Phone, MoreVertical,
    CheckCircle2, Clock, AlertCircle, ArrowRight, ExternalLink,
    Zap, Star, MapPin, Calendar, Loader2, ChevronDown, Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
    NEW: { label: "YENİ", color: "bg-blue-100 text-blue-700", icon: Zap },
    CONTACTED: { label: "İLETİŞİME GEÇİLDİ", color: "bg-amber-100 text-amber-700", icon: MessageSquare },
    QUOTED: { label: "TEKLİF VERİLDİ", color: "bg-purple-100 text-purple-700", icon: Clock },
    REPLIED: { label: "YANITLANDI", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    CLOSED: { label: "KAZANILDI", color: "bg-emerald-600 text-white", icon: Star },
    LOST: { label: "KAYBEDİLDİ", color: "bg-slate-100 text-slate-500", icon: AlertCircle },
};

export default function LeadsClient() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, [filter]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const url = filter === "ALL" ? "/api/business/leads" : `/api/business/leads?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
            }
        } catch (error) {
            toast.error("Talepler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (leadId, newStatus) => {
        setIsUpdating(true);
        try {
            const res = await fetch("/api/business/leads", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Talep durumu güncellendi.");
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
                if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus });
            }
        } catch (error) {
            toast.error("Güncelleme başarısız.");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 font-inter antialiased">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 italic uppercase tracking-tight">Talep Merkezi</h1>
                    <p className="mt-2 text-slate-500 font-bold text-sm leading-relaxed">
                        Gelen müşteri taleplerini yönetin, teklif verin ve kazanca dönüştürün.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="İsim veya mesajda ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm w-full md:w-64"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                        <option value="ALL">Tüm Talepler</option>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Lead List */}
                <div className="lg:col-span-5 space-y-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-[24px] bg-white animate-pulse border border-slate-100" />
                        ))
                    ) : filteredLeads.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 border border-dashed border-slate-200 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 uppercase italic">Talep Bulunamadı</h3>
                            <p className="text-sm text-slate-500 font-bold">Aradığınız kriterlere uygun sonuç yok.</p>
                        </div>
                    ) : (
                        filteredLeads.map(lead => (
                            <motion.div
                                layout
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className={`group p-5 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden ${selectedLead?.id === lead.id
                                        ? "bg-white border-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-blue-600"
                                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg shadow-sm"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${STATUS_CONFIG[lead.status]?.color}`}>
                                                {STATUS_CONFIG[lead.status]?.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: tr })}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-black text-slate-950 truncate">{lead.name}</h4>
                                        <p className="mt-1 text-sm text-slate-500 font-medium line-clamp-1 leading-relaxed">
                                            {lead.message}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${selectedLead?.id === lead.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                        }`}>
                                        <ChevronDown className={`w-5 h-5 transition-transform ${selectedLead?.id === lead.id ? "rotate-90" : "-rotate-90"}`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Lead Detail View */}
                <div className="lg:col-span-7 sticky top-8">
                    <AnimatePresence mode="wait">
                        {!selectedLead ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 rounded-[40px] border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                                    <ArrowRight className="w-10 h-10 text-slate-300 -rotate-45" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tight">Detayları Gör</h3>
                                    <p className="text-slate-500 font-bold max-w-xs mx-auto">Talebin detaylarını ve iletişim bilgilerini görmek için soldan bir kart seçin.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-8 md:p-10 space-y-10"
                            >
                                {/* Detail Header */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                <Users className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-950">{selectedLead.name}</h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                                                        {STATUS_CONFIG[selectedLead.status]?.label}
                                                    </span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-xs text-slate-400 font-bold">
                                                        {new Date(selectedLead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(`tel:${selectedLead.phone}`)}
                                            className="p-4 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 hover:bg-slate-100 transition-all group"
                                        >
                                            <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const phone = selectedLead.phone?.replace(/[^0-9]/g, '');
                                                window.open(`https://wa.me/90${phone}`, "_blank");
                                                if (selectedLead.status === 'NEW') updateStatus(selectedLead.id, 'CONTACTED');
                                            }}
                                            className="px-6 py-4 rounded-2xl bg-[#25D366] text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#20bd5aa0] transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
                                        >
                                            <MessageSquare className="w-4 h-4 fill-current" />
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mesaj</label>
                                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-slate-700 font-semibold leading-relaxed">
                                                {selectedLead.message}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Telefon</label>
                                                <p className="font-bold text-slate-900">{selectedLead.phone || "Belirtilmedi"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-posta</label>
                                                <p className="font-bold text-slate-900 truncate">{selectedLead.email || "Belirtilmedi"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-[32px] bg-blue-50 border border-blue-100 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                                                <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Hızlı İşlemler</h4>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: 'CONTACTED', label: 'İletişime Geçildi' },
                                                    { id: 'QUOTED', label: 'Teklif Verildi' },
                                                    { id: 'CLOSED', label: 'Kazandım' },
                                                    { id: 'LOST', label: 'Kaybettim' }
                                                ].map(action => (
                                                    <button
                                                        key={action.id}
                                                        disabled={selectedLead.status === action.id || isUpdating}
                                                        onClick={() => updateStatus(selectedLead.id, action.id)}
                                                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${selectedLead.status === action.id
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-white text-slate-600 hover:bg-slate-100"
                                                            } disabled:opacity-50`}
                                                    >
                                                        {action.label}
                                                        {selectedLead.status === action.id && <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bölge</p>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {selectedLead.district ? `${selectedLead.district}, ${selectedLead.city}` : selectedLead.city || "Konum Belirtilmedi"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Oluşturulma: {new Date(selectedLead.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <Link href="/business/dashboard" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                        Dashboard'a Dön <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
