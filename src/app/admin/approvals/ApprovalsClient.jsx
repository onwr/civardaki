"use client";

import { useState } from "react";
import { ShieldCheck, Search, CheckCircle, XCircle, Trash2, Star, User, Flag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ApprovalsClient({ initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED

    // Filter Logic
    const reviewerDisplay = (r) => r.reviewerName || r.user?.name || "Anonim";
    const filteredReviews = reviews.filter(r => {
        const name = reviewerDisplay(r);
        const matchesSearch =
            (r.business?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            name.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "REPORTED") {
            matchesStatus = !!r.reportedAt;
        } else if (statusFilter !== "ALL") {
            matchesStatus = (r.status || "").toUpperCase() === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/admin/reviews/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Ağ hatası");

            toast.success(`Yorum durumu güncellendi: ${newStatus}`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            toast.error("Güncelleme başarısız.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silme başarısız");

            toast.success("Yorum silindi.");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Moderasyon Modülü
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        YORUM <br /><span className="text-blue-600">ONAYLARI</span>
                    </h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 border border-slate-200 focus-within:border-[#004aad]/30 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-900/5 transition-all rounded-2xl w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="İşletme, içerik veya yazar ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-black italic text-slate-950 placeholder:text-slate-400 w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    {["ALL", "PENDING", "APPROVED", "REJECTED", "REPORTED"].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === st ? 'bg-slate-950 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {st === "ALL" ? "Tümü" : st === "REPORTED" ? "Bildirilenler" : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic w-1/4">İşletme</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic w-1/4">Yazar / Puan</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic w-1/3">İçerİk</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic text-center w-w-32">Durum</th>
                                <th className="p-6 text-[10px] font-black tracking-widest uppercase text-slate-400 italic text-right">Aksİyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReviews.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <Link href={`/business/${r.business?.slug}`} target="_blank" className="font-black text-[#004aad] text-sm italic tracking-tight hover:underline">
                                            {r.business?.name}
                                        </Link>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold text-sm">
                                            <User className="w-4 h-4 text-slate-400" /> {reviewerDisplay(r)}
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm line-clamp-3" title={r.content}>
                                            "{r.content}"
                                        </p>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col gap-1.5 items-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 ${r.status === 'APPROVED' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                                                    r.status === 'REJECTED' ? 'text-rose-600 border-rose-100 bg-rose-50' :
                                                        'text-amber-600 border-amber-100 bg-amber-50'
                                                }`}>
                                                {r.status === 'PENDING' ? 'BEKLİYOR' : r.status}
                                            </span>
                                            {r.reportedAt && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-200 text-rose-600 bg-rose-50">
                                                    <Flag className="w-3 h-3" /> Bildirilen
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right space-x-2">
                                        {r.status !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                                title="Onayla"
                                                className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors inline-block"
                                            >
                                                <CheckCircle className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                        {r.status !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                                                title="Reddet"
                                                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors inline-block"
                                            >
                                                <XCircle className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            title="Kalıcı Sil"
                                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors inline-block ml-2 border-l border-slate-200 pl-4"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReviews.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">
                                        Gösterilecek yorum bulunamadı.
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
