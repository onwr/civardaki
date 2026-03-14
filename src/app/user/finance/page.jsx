"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Plus,
    Landmark,
    User,
    X,
    Check,
    Loader2,
    PieChart,
} from "lucide-react";
import { toast } from "sonner";

// Format Functions
const formatCurrency = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatNumber = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "");
};

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        type: "EXPENSE",
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        dueDate: "",
        totalAmount: "",
        creditLimit: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [activeTab, page]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/finance/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("İstatistikler yüklenemedi");
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const type = activeTab === "overview" ? "" : `&type=${activeTab}`;
            const res = await fetch(
                `/api/finance/transactions?page=${page}&limit=20${type}`
            );
            if (!res.ok) throw new Error("Failed to fetch transactions");
            const data = await res.json();
            setTransactions(data.transactions);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("İşlemler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Başlık gerekli";
        if (!formData.amount || parseFloat(formData.amount.replace(/\./g, "")) <= 0)
            newErrors.amount = "Geçerli tutar girin";
        if (!formData.date) newErrors.date = "Tarih gerekli";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddTransaction = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const cleanAmount = parseFloat(formData.amount.replace(/\./g, ""));
            const cleanTotalAmount = formData.totalAmount
                ? parseFloat(formData.totalAmount.replace(/\./g, ""))
                : null;
            const cleanCreditLimit = formData.creditLimit
                ? parseFloat(formData.creditLimit.replace(/\./g, ""))
                : null;

            const res = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: cleanAmount,
                    totalAmount: cleanTotalAmount,
                    creditLimit: cleanCreditLimit,
                }),
            });

            if (!res.ok) throw new Error("Failed to add transaction");

            toast.success("İşlem başarıyla eklendi!");
            setIsModalOpen(false);
            setFormData({
                type: "EXPENSE",
                title: "",
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                description: "",
                dueDate: "",
                totalAmount: "",
                creditLimit: "",
            });
            setPage(1);
            setErrors({});
            await fetchTransactions();
            await fetchStats();
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast.error("İşlem eklenemedi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm("İşlemi silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`/api/finance/transactions?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete transaction");

            toast.success("İşlem silindi!");
            await fetchTransactions();
            await fetchStats();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast.error("İşlem silinemedi");
        }
    };

    const tabs = [
        { id: "overview", label: "Genel Bakış", icon: PieChart },
        { id: "INCOME", label: "Gelirler", icon: TrendingUp },
        { id: "EXPENSE", label: "Giderler", icon: TrendingDown },
        { id: "CREDIT_CARD", label: "Kredi Kartları", icon: CreditCard },
        { id: "DEBT", label: "Borçlar", icon: User },
        { id: "LOAN", label: "Krediler", icon: Landmark },
    ];

    return (
        <div className="space-y-10 pb-20 font-inter antialiased">
            {/* Header */}
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                            Kişisel Finans
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                        Hesap Kitap
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Yeni İşlem Ekle
                </button>
            </section>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        layoutId="balance-card"
                        className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Wallet className="w-64 h-64 -rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                            <div>
                                <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">
                                    Net Varlığım
                                </p>
                                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">
                                    ₺{stats.totalBalance.toLocaleString("tr-TR", {
                                        minimumFractionDigits: 2,
                                    })}
                                </h2>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex-1">
                                    <div className="flex items-center gap-2 text-indigo-200 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            Bu Ay Gelir
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight">
                                        ₺{stats.monthlyIncome.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex-1">
                                    <div className="flex items-center gap-2 text-indigo-200 mb-1">
                                        <TrendingDown className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            Bu Ay Gider
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight">
                                        ₺{stats.monthlyExpense.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex-1 flex flex-col justify-center gap-4 group hover:border-indigo-100 transition-colors">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                                    Toplam Borçlar
                                </p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">
                                    ₺{stats.totalDebt.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex-1 flex flex-col justify-center gap-4 group hover:border-indigo-100 transition-colors">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                                    Kart Borçları
                                </p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">
                                    ₺{stats.totalCreditCardDebt.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setPage(1);
                        }}
                        className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-lg scale-105"
                                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <motion.div layout className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : transactions.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {transactions.map((tx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-100 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg shadow-inner ${tx.type === "INCOME"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : tx.type === "EXPENSE"
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : tx.type === "DEBT"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {tx.type === "INCOME" ? (
                                            <TrendingUp className="w-6 h-6" />
                                        ) : tx.type === "EXPENSE" ? (
                                            <TrendingDown className="w-6 h-6" />
                                        ) : tx.type === "CREDIT_CARD" ? (
                                            <CreditCard className="w-6 h-6" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900">
                                            {tx.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            <span>{tx.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>
                                                {new Date(tx.date).toLocaleDateString("tr-TR")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:text-right flex items-center justify-between md:block">
                                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        TUTAR
                                    </span>
                                    <div>
                                        <p
                                            className={`text-2xl font-black tracking-tight ${tx.type === "INCOME"
                                                    ? "text-emerald-600"
                                                    : "text-slate-900"
                                                }`}
                                        >
                                            {tx.type === "INCOME" ? "+" : "-"}₺
                                            {tx.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            {tx.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
                    >
                        <p className="text-slate-400 font-bold uppercase tracking-widest">
                            Bu kategoride işlem bulunamadı.
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors font-bold"
                    >
                        Önceki
                    </button>
                    <span className="font-bold text-slate-600">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors font-bold"
                    >
                        Sonraki
                    </button>
                </div>
            )}

            {/* MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
                                    <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
                                        Yeni İşlem Ekle
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors flex-shrink-0"
                                    >
                                        <X className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            {
                                                id: "INCOME",
                                                label: "Gelir",
                                                color: "bg-emerald-100 text-emerald-700 ring-emerald-500",
                                            },
                                            {
                                                id: "EXPENSE",
                                                label: "Gider",
                                                color: "bg-indigo-100 text-indigo-700 ring-indigo-500",
                                            },
                                            {
                                                id: "DEBT",
                                                label: "Borç",
                                                color: "bg-rose-100 text-rose-700 ring-rose-500",
                                            },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() =>
                                                    setFormData({ ...formData, type: type.id })
                                                }
                                                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === type.id
                                                        ? `ring-2 ring-offset-2 ${type.color}`
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {
                                                id: "LOAN",
                                                label: "Kredi",
                                                color: "bg-amber-100 text-amber-700 ring-amber-500",
                                            },
                                            {
                                                id: "CREDIT_CARD",
                                                label: "Kredi Kartı",
                                                color: "bg-purple-100 text-purple-700 ring-purple-500",
                                            },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() =>
                                                    setFormData({ ...formData, type: type.id })
                                                }
                                                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === type.id
                                                        ? `ring-2 ring-offset-2 ${type.color}`
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-4">
                                        {/* Başlık */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                İşlem Başlığı
                                            </label>
                                            <input
                                                type="text"
                                                maxLength="50"
                                                value={formData.title}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        title: e.target.value.substring(0, 50),
                                                    })
                                                }
                                                placeholder="Örn: Market Alışverişi"
                                                className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 ${errors.title ? "border-red-300" : "border-slate-200"
                                                    }`}
                                            />
                                            <div className="flex justify-between mt-1">
                                                {errors.title && (
                                                    <p className="text-xs text-red-600 font-semibold">
                                                        {errors.title}
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-400 ml-auto">
                                                    {formData.title.length}/50
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tutar */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                Tutar (TL)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-4 text-2xl font-black text-slate-400">
                                                    ₺
                                                </span>
                                                <input
                                                    type="text"
                                                    value={formatCurrency(formData.amount)}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            amount: formatNumber(e.target.value),
                                                        })
                                                    }
                                                    placeholder="0"
                                                    inputMode="numeric"
                                                    className={`w-full pl-10 pr-5 py-4 bg-slate-50 border-2 rounded-2xl font-black text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 ${errors.amount ? "border-red-300" : "border-slate-200"
                                                        }`}
                                                />
                                            </div>
                                            {errors.amount && (
                                                <p className="text-xs text-red-600 font-semibold mt-1">
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>

                                        {/* Kategori & Tarih */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                    Kategori
                                                </label>
                                                <input
                                                    type="text"
                                                    maxLength="30"
                                                    value={formData.category}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            category: e.target.value.substring(0, 30),
                                                        })
                                                    }
                                                    placeholder="Genel"
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                    Tarih
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, date: e.target.value })
                                                    }
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Açıklama */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                Açıklama
                                            </label>
                                            <textarea
                                                maxLength="200"
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description: e.target.value.substring(0, 200),
                                                    })
                                                }
                                                placeholder="İsteğe bağlı not..."
                                                rows={2}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder:text-slate-400"
                                            />
                                            <p className="text-xs text-slate-400 mt-1 text-right">
                                                {formData.description.length}/200
                                            </p>
                                        </div>

                                        {/* Kredi Kartı Limiti */}
                                        {formData.type === "CREDIT_CARD" && (
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                    Kredi Limiti (TL)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-3 text-lg font-black text-slate-400">
                                                        ₺
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={formatCurrency(formData.creditLimit)}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                creditLimit: formatNumber(e.target.value),
                                                            })
                                                        }
                                                        placeholder="0"
                                                        inputMode="numeric"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Toplam Kredi Tutarı */}
                                        {formData.type === "LOAN" && (
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                    Toplam Kredi Tutarı (TL)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-3 text-lg font-black text-slate-400">
                                                        ₺
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={formatCurrency(formData.totalAmount)}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                totalAmount: formatNumber(e.target.value),
                                                            })
                                                        }
                                                        placeholder="0"
                                                        inputMode="numeric"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Son Ödeme Tarihi */}
                                        {(formData.type === "DEBT" || formData.type === "LOAN") && (
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-2">
                                                    Son Ödeme Tarihi (İsteğe Bağlı)
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            dueDate: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleAddTransaction}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#004aad] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                                KAYDEDILIYOR
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" /> KAYDET
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}