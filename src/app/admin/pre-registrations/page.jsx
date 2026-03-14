"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Mail,
    Instagram,
    Phone,
    MoreHorizontal,
    ArrowUpDown,
    Calendar,
    Zap,
    ShieldCheck,
    UserCircle2,
    Building2,
    User,
    Trash2,
    Eye,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function PreRegistrationAdminPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [selectedReg, setSelectedReg] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "pre_registrations"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRegistrations(data);
            setLoading(false);
        }, (error) => {
            console.error("Firebase fetch error:", error);
            toast.error("Veriler yüklenirken bir hata oluştu.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "pre_registrations", id));
                toast.success("Kayıt başarıyla silindi.");
            } catch (error) {
                toast.error("Silme işlemi başarısız oldu.");
            }
        }
    };

    const filteredData = registrations.filter(item => {
        const searchMatch =
            item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.includes(searchTerm);

        const typeMatch = filterType === "all" || item.userType === filterType;

        return searchMatch && typeMatch;
    });

    const stats = {
        total: registrations.length,
        customer: registrations.filter(r => r.userType === "customer").length,
        provider: registrations.filter(r => r.userType === "individual_provider" || r.userType === "business").length,
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "customer": return <UserCircle2 className="w-4 h-4 text-blue-500" />;
            case "business": return <Building2 className="w-4 h-4 text-emerald-500" />;
            case "individual_provider": return <User className="w-4 h-4 text-purple-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "customer": return "Müşteri";
            case "business": return "İşletme";
            case "individual_provider": return "Bireysel";
            default: return type;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#004aad] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">ÖN KAYITLAR</h1>
                    </div>
                    <p className="text-slate-500 font-bold italic text-xs uppercase tracking-widest pl-1">Sisteme kayıtlı erken erişim talepleri</p>
                </div>

                <div className="flex gap-4">
                    {[
                        { label: "TOPLAM", val: stats.total, color: "bg-slate-900" },
                        { label: "MÜŞTERİ", val: stats.customer, color: "bg-blue-600" },
                        { label: "HİZMET/İŞLETME", val: stats.provider, color: "bg-emerald-600" }
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.color} p-4 rounded-2xl shadow-xl flex flex-col items-center min-w-[100px]`}>
                            <span className="text-[9px] font-black text-white/60 italic tracking-widest mb-1">{stat.label}</span>
                            <span className="text-xl font-black text-white italic leading-none">{stat.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-[#004aad] transition-colors" />
                    <input
                        type="text"
                        placeholder="Kayıtlarda ara (Ad, E-posta, Telefon)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold italic outline-none focus:ring-2 focus:ring-[#004aad]/10 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 mr-2" />
                    {["all", "customer", "individual_provider", "business"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-3 rounded-xl text-[10px] font-black italic uppercase tracking-wider transition-all border ${filterType === type
                                    ? "bg-[#004aad] text-white border-[#004aad] shadow-lg shadow-blue-500/20"
                                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                                }`}
                        >
                            {type === "all" ? "Hepsi" : getTypeLabel(type)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Kayıt Tarihi</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Kullanıcı Bilgisi</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Tip</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-slate-400 uppercase tracking-widest">İletişim</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-slate-400 uppercase tracking-widest">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-[#004aad] animate-spin mx-auto pb-4" />
                                        <p className="text-xs font-bold italic text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-xs font-bold italic text-slate-400 uppercase tracking-widest">Kayıt Bulunamadı</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-700 italic">
                                                    {item.createdAt?.toDate ? format(item.createdAt.toDate(), "dd MMMM yyyy", { locale: tr }) : "-"}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 italic mt-1 uppercase">
                                                    {item.createdAt?.toDate ? format(item.createdAt.toDate(), "HH:mm", { locale: tr }) : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black italic text-xs shadow-sm">
                                                    {item.firstName?.[0]}{item.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 italic tracking-tight leading-none truncate max-w-[150px]">
                                                        {item.firstName} {item.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <Instagram className="w-3 h-3 text-rose-500" />
                                                        <span className="text-[10px] font-bold text-slate-400 italic">@{item.instagram}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
                                                {getTypeIcon(item.userType)}
                                                <span className="text-[10px] font-black text-slate-600 italic uppercase">
                                                    {getTypeLabel(item.userType)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[11px] font-bold text-slate-600 italic">{item.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[11px] font-bold text-slate-600 italic">+90 {item.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedReg(item)}
                                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Görüntüle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Details */}
            <AnimatePresence>
                {selectedReg && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedReg(null)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200]"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl z-[210] overflow-hidden"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center text-2xl font-black italic text-slate-800 shadow-inner">
                                            {selectedReg.firstName?.[0]}{selectedReg.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic text-slate-900 leading-none truncate max-w-[200px]">
                                                {selectedReg.firstName} {selectedReg.lastName}
                                            </h3>
                                            <p className="text-xs font-bold text-[#004aad] italic mt-2 uppercase tracking-widest">{getTypeLabel(selectedReg.userType)} Kaydı</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedReg(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                                        <XCircle className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Instagram className="w-5 h-5 text-rose-500" />
                                                <span className="text-sm font-black italic text-slate-800">@{selectedReg.instagram}</span>
                                            </div>
                                            <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                                                <Mail className="w-5 h-5 text-blue-500" />
                                                <span className="text-sm font-black italic text-slate-800">{selectedReg.email}</span>
                                            </div>
                                            <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                                                <Phone className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-black italic text-slate-800">+90 {selectedReg.phone}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl space-y-3">
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-[10px] font-black text-slate-400 italic uppercase">KVKK Onayı</span>
                                                <CheckCircle2 className={`w-5 h-5 ${selectedReg.kvkk ? "text-emerald-500" : "text-slate-200"}`} />
                                            </div>
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-[10px] font-black text-slate-400 italic uppercase">İletişim İzni</span>
                                                <CheckCircle2 className={`w-5 h-5 ${selectedReg.communicationPermission ? "text-emerald-500" : "text-slate-200"}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedReg(null)}
                                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black italic uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all"
                                >
                                    KAPAT
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
