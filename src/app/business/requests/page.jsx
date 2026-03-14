"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    PaperAirplaneIcon,
    PlusIcon,
    SparklesIcon,
    FaceSmileIcon,
    FaceFrownIcon,
    InformationCircleIcon,
    PaperClipIcon,
    ChevronLeftIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { mockRequests } from "@/lib/mock-data/business-requests";
import { toast } from "sonner";

export default function BusinessRequestsPage() {
    const [activeRequestId, setActiveRequestId] = useState(mockRequests[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [replyText, setReplyText] = useState("");

    // Mobile View Management
    const [view, setView] = useState("list"); // list, chat, info
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const filteredRequests = useMemo(() => {
        return mockRequests.filter(req => {
            const matchesSearch = req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === "all" || req.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filter]);

    const activeRequest = useMemo(() => {
        return mockRequests.find(req => req.id === activeRequestId);
    }, [activeRequestId]);

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        toast.success("Yanıtınız gönderildi!");
        setReplyText("");
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "new": return <span className="px-2 py-0.5 bg-blue-100 text-[#004aad] text-[10px] font-black uppercase rounded-full">YENİ</span>;
            case "in-progress": return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full">İŞLEMDE</span>;
            case "answered": return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">YANITLANDI</span>;
            default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full">KAPALI</span>;
        }
    };

    const getPriorityIcon = (priority) => {
        if (priority === "high") return <ExclamationCircleIcon className="w-4 h-4 text-rose-500" title="Yüksek Öncelik" />;
        return null;
    };

    const getSentimentIcon = (sentiment) => {
        if (sentiment === "positive") return <FaceSmileIcon className="w-4 h-4 text-emerald-500" />;
        if (sentiment === "negative") return <FaceFrownIcon className="w-4 h-4 text-rose-500" />;
        return <InformationCircleIcon className="w-4 h-4 text-blue-400" />;
    };

    const handleRequestClick = (id) => {
        setActiveRequestId(id);
        if (isMobile) setView("chat");
    };

    return (
        <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] flex gap-4 md:gap-6 overflow-hidden relative">

            {/* 1. Requests List Sidebar */}
            <div className={`
        ${isMobile && view !== "list" ? "hidden" : "flex"} 
        w-full lg:w-96 flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden
      `}>
                {/* Header & Search */}
                <div className="p-6 border-b border-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-gray-900">Müşteri Talepleri</h1>
                        <div className="bg-blue-50 text-[#004aad] px-3 py-1 rounded-full text-xs font-black">
                            {mockRequests.filter(r => r.status === "new").length} YENİ
                        </div>
                    </div>

                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
                        <input
                            type="text"
                            placeholder="Talep veya müşteri ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#004aad]/10 text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        {["all", "new", "in-progress", "answered"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                  ${filter === f ? 'bg-[#004aad] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                {f === 'all' ? 'Tümü' : f === 'new' ? 'Yeni' : f === 'in-progress' ? 'İşlemde' : 'Yanıtlı'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredRequests.map((req) => (
                        <motion.button
                            key={req.id}
                            layoutId={req.id}
                            onClick={() => handleRequestClick(req.id)}
                            className={`w-full p-4 rounded-3xl text-left transition-all relative overflow-hidden group
                ${activeRequestId === req.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                        >
                            {activeRequestId === req.id && !isMobile && (
                                <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-[#004aad]" />
                            )}

                            <div className="flex gap-3">
                                <div className="relative shrink-0">
                                    <Image src={req.customerAvatar} alt={req.customerName} width={40} height={40} className="rounded-2xl shrink-0" />
                                    <div className="absolute -bottom-1 -right-1">
                                        {getSentimentIcon(req.sentiment)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-gray-900 truncate">{req.customerName}</h3>
                                        <span className="text-[10px] text-gray-400 font-bold shrink-0">
                                            {req.date.getHours()}:{req.date.getMinutes().toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <p className="text-xs font-black text-[#004aad] uppercase tracking-tighter mb-1 truncate">{req.subject}</p>
                                    <p className="text-xs text-gray-400 line-clamp-1 mb-2">{req.message}</p>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(req.status)}
                                        {getPriorityIcon(req.priority)}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 2. Request Details & Chat Content */}
            <div className={`
        ${isMobile && view === "list" ? "hidden" : view === "chat" || !isMobile ? "flex" : "hidden"} 
        flex-1 flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden
      `}>
                {activeRequest ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                                {isMobile && (
                                    <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-1">
                                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                                    </button>
                                )}
                                <Image src={activeRequest.customerAvatar} alt={activeRequest.customerName} width={40} height={40} className="rounded-2xl md:rounded-[1.25rem] shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base md:text-lg font-black text-gray-900 truncate">{activeRequest.customerName}</h2>
                                        <CheckBadgeIcon className="w-4 h-4 md:w-5 md:h-5 text-[#004aad] shrink-0" />
                                    </div>
                                    <p className="text-[10px] md:text-xs text-gray-400 font-bold truncate">{activeRequest.type} • {activeRequest.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {isMobile && (
                                    <button onClick={() => setView("info")} className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                                        <UserIcon className="w-5 h-5" />
                                    </button>
                                )}
                                {!isMobile && (
                                    <>
                                        <button className="px-4 py-2 border border-gray-100 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 transition-all">
                                            Talebi Kapat
                                        </button>
                                        <button className="px-4 py-2 bg-[#004aad] text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10">
                                            Aksiyon Al
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* AI Insight Bar */}
                        <div className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/30 border-b border-gray-50 flex items-center justify-between overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 shrink-0">
                                <SparklesIcon className="w-4 h-4 text-purple-600 shrink-0" />
                                <span className="text-[9px] md:text-[10px] font-black text-purple-600 uppercase tracking-widest whitespace-nowrap">Yapay Zeka:</span>
                                <span className="text-[10px] md:text-xs text-gray-600 font-medium whitespace-nowrap lg:whitespace-normal">Müşteri potansiyel toplu alım yapmak istiyor.</span>
                            </div>
                            {!isMobile && (
                                <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg border border-purple-100 shrink-0">
                                    <span className="text-[10px] font-black text-purple-600">MOD:</span>
                                    {getSentimentIcon(activeRequest.sentiment)}
                                </div>
                            )}
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-gray-50/30">
                            <div className="flex justify-center mb-4">
                                <span className="px-4 py-1 bg-white border border-gray-100 rounded-full text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                                    Talep Açıldı • {activeRequest.date.toLocaleDateString('tr-TR')}
                                </span>
                            </div>

                            {activeRequest.messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.isCustomer ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.isCustomer ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
                                        <div className={`p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm ${msg.isCustomer
                                                ? 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'
                                                : 'bg-[#004aad] text-white rounded-tr-none'
                                            }`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            <div className={`mt-2 flex items-center gap-2 ${msg.isCustomer ? 'text-gray-400' : 'text-blue-100'}`}>
                                                <span className="text-[10px] font-bold">
                                                    {msg.date.getHours()}:{msg.date.getMinutes().toString().padStart(2, '0')}
                                                </span>
                                                {!msg.isCustomer && <CheckCircleIcon className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white border-t border-gray-50 space-y-4">
                            {/* Quick AI Replies */}
                            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                <button className="shrink-0 px-3 py-2 bg-purple-50 text-purple-700 text-[9px] md:text-[10px] font-black uppercase rounded-xl border border-purple-100 hover:bg-purple-100 transition-all flex items-center gap-1.5 md:gap-2">
                                    <SparklesIcon className="w-3 h-3" /> Fiyat Listesi
                                </button>
                                <button className="shrink-0 px-3 py-2 bg-blue-50 text-[#004aad] text-[9px] md:text-[10px] font-black uppercase rounded-xl border border-blue-100 hover:bg-blue-100 transition-all">
                                    Müsaitlik
                                </button>
                                <button className="shrink-0 px-3 py-2 bg-gray-50 text-gray-500 text-[9px] md:text-[10px] font-black uppercase rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
                                    Teşekkür Et
                                </button>
                            </div>

                            <div className="flex items-end gap-2 md:gap-4">
                                <div className="flex-1 relative">
                                    <textarea
                                        rows={1}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Yanıt yaz..."
                                        className="w-full pl-4 md:pl-6 pr-10 md:pr-12 py-3 md:py-4 bg-gray-50 border-none rounded-[1.5rem] md:rounded-[2rem] outline-none focus:ring-2 focus:ring-[#004aad]/10 text-sm font-medium resize-none transition-all"
                                    />
                                    <div className="absolute right-3 md:right-4 bottom-3 md:bottom-4 flex gap-2">
                                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                            <PaperClipIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim()}
                                    className="p-3 md:p-4 bg-[#004aad] text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6 -rotate-45" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center">
                            <ChatBubbleLeftRightIcon className="w-12 h-12 text-[#004aad] opacity-20" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Bir Talep Seçin</h2>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Detayları görmek ve yanıtlamak için sol panelden bir talep seçerek başlayın.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Customer Quick Info Panel */}
            <div className={`
        ${isMobile && view !== "info" ? "hidden" : view === "info" || !isMobile ? "flex" : "hidden"} 
        w-full lg:w-80 flex-col gap-6 
        ${isMobile ? "absolute inset-0 z-50 bg-gray-50 p-4" : ""}
      `}>
                {isMobile && (
                    <div className="flex items-center gap-4 mb-2">
                        <button onClick={() => setView("chat")} className="p-3 bg-white shadow-sm rounded-2xl">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
                        </button>
                        <h2 className="text-xl font-black text-gray-900">Müşteri Profili</h2>
                    </div>
                )}

                {activeRequest && (
                    <>
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 items-center flex flex-col text-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 relative mb-4">
                                <Image src={activeRequest.customerAvatar} alt={activeRequest.customerName} fill className="rounded-2xl md:rounded-[2.5rem] object-cover" />
                                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-xl md:rounded-2xl border-2 md:border-4 border-white flex items-center justify-center">
                                    <CheckCircleIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                </div>
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-gray-900">{activeRequest.customerName}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-6">VIP MÜŞTERİ</p>

                            <div className="w-full grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="p-3 md:p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOPLAM</p>
                                    <p className="text-base md:text-lg font-black text-gray-900">2.450 ₺</p>
                                </div>
                                <div className="p-3 md:p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SİPARİŞ</p>
                                    <p className="text-base md:text-lg font-black text-gray-900">12</p>
                                </div>
                            </div>

                            <button className="w-full py-3 md:py-4 border border-gray-100 rounded-2xl text-[11px] md:text-xs font-black text-gray-900 hover:bg-gray-50 transition-all">
                                Profili Görüntüle
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 flex-1 md:flex-none">
                            <h4 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6">SON ETKİLEŞİMLER</h4>
                            <div className="space-y-4 md:space-y-6">
                                {[
                                    { type: "Sipariş #8821", date: "2 gün önce", icon: ShoppingCartIcon, color: "text-blue-600", bg: "bg-blue-50" },
                                    { type: "Yorum Paylaştı", date: "1 hafta önce", icon: SparklesIcon, color: "text-amber-600", bg: "bg-amber-50" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className={`w-9 h-9 md:w-10 md:h-10 ${item.bg} ${item.color} rounded-xl shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] md:text-xs font-black text-gray-900">{item.type}</p>
                                            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold">{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isMobile && (
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button className="py-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase">Talebi Kapat</button>
                                <button className="py-4 bg-[#004aad] text-white rounded-2xl text-xs font-black uppercase">Aksiyon Al</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Missing icon imports helper
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
