"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DollarSign,
    TrendingUp,
    Users,
    Package,
    ShoppingCart,
    MessageSquare,
    Star,
    BarChart3,
    AlertTriangle,
    ChevronRight,
    ShieldCheck,
    Banknote,
    Target,
    Eye,
    Zap,
    GripVertical,
    EyeOff,
    CalendarDays,
    Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/SocketProvider";
import DashboardReferralCard from "@/components/dashboard/DashboardReferralCard";
import DashboardSubscriptionWidget from "@/components/dashboard/DashboardSubscriptionWidget";
import OnboardingCompletion from "@/components/business/OnboardingCompletion";
import BroadcastSlot from "@/components/broadcast/BroadcastSlot";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";

const formatMoney = (value) => {
    if (value == null || isNaN(value)) return "0₺";
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
};

function SimpleDashboardCard({ card }) {
    return (
        <Link href={card.href} className={`group block p-6 rounded-2xl border ${card.border} ${card.bg} hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color} border ${card.border}`}>
                    <card.icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">{card.title}</p>
            <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{card.value}</p>
            {card.sub && <p className="text-sm text-slate-500 mt-1">{card.sub}</p>}
        </Link>
    );
}

function SortableDashboardCard({ card, isHidden, onToggle }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
    return (
        <div ref={setNodeRef} style={style} className={`p-6 rounded-2xl border ${card.border} ${card.bg} ${isHidden ? "opacity-60" : ""} hover:shadow-lg transition-all`}>
            <div className="flex items-start justify-between gap-2">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/50 touch-none shrink-0">
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color} border ${card.border}`}>
                    <card.icon className="w-6 h-6" />
                </div>
                <button
                    type="button"
                    onClick={() => onToggle(card.id, !isHidden)}
                    className={`p-2 rounded-lg shrink-0 ${isHidden ? "bg-slate-200 text-slate-500" : "bg-emerald-100 text-emerald-600"}`}
                    title={isHidden ? "Göster" : "Gizle"}
                >
                    {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">{card.title}</p>
            <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{card.value}</p>
            {card.sub && <p className="text-sm text-slate-500 mt-1">{card.sub}</p>}
        </div>
    );
}

function DashboardCardsGrid({ allOrderedCards, statCards, customizeMode, preferences, onDragEnd, sensors, toggleVisibility }) {
    const hiddenSet = new Set(preferences.hidden || []);
    if (!customizeMode) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <SimpleDashboardCard key={card.id} card={card} />
                ))}
            </div>
        );
    }
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={allOrderedCards.map((c) => c.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allOrderedCards.map((card) => (
                        <SortableDashboardCard
                            key={card.id}
                            card={card}
                            isHidden={hiddenSet.has(card.id)}
                            onToggle={(id, hide) => { toggleVisibility(id, hide); toast.success(hide ? "Kart gizlendi." : "Kart gösterildi."); }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export default function DashboardClient({ slug }) {
    const { data: session, status } = useSession();
    const { socket, isConnected } = useSocket();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/business/dashboard-summary", { cache: "no-store" });
                if (cancelled) return;
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [refreshKey]);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const onNewOrder = () => setRefreshKey((k) => k + 1);
        socket.on("new_order", onNewOrder);
        return () => socket.off("new_order", onNewOrder);
    }, [socket, isConnected]);

    useEffect(() => {
        const onFocus = () => setRefreshKey((k) => k + 1);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const searchParams = useSearchParams();
    const { preferences, updateOrder, toggleVisibility } = useDashboardPreferences();
    const [customizeMode, setCustomizeMode] = useState(() => searchParams.get("customize") === "1");
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        setCustomizeMode(searchParams.get("customize") === "1");
    }, [searchParams]);

    const business = data?.business;
    const m = data?.metrics;

    if (status === "loading" || loading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-[2.5rem]" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-36 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || !business) {
        return (
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-12 text-center">
                <p className="text-slate-600 font-semibold">Panel verisi yüklenemedi.</p>
            </div>
        );
    }

    const statCardsRaw = [
        { id: "revenue", title: "Günlük Ciro", value: formatMoney(m?.revenueToday), sub: `${m?.orderCountToday ?? 0} sipariş`, icon: DollarSign, href: "/business/orders", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { id: "expense", title: "Günlük Masraf", value: formatMoney(m?.expenseToday), sub: "Aylık: " + formatMoney(m?.expenseMonth), icon: Banknote, href: "/business/cash/expenses", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        { id: "employees", title: "Çalışan Sayısı", value: m?.employeeCount ?? 0, sub: "Aktif personel", icon: Users, href: "/business/employees", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { id: "products", title: "Ürün / Stok", value: m?.productCount ?? 0, sub: `${m?.categoryCount ?? 0} kategori`, icon: Package, href: "/business/products", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
        { id: "orders", title: "Sipariş (Bu Ay)", value: m?.orderCountMonth ?? 0, sub: formatMoney(m?.revenueMonth) + " ciro", icon: ShoppingCart, href: "/business/orders", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
        { id: "leads", title: "Müşteri Talepleri", value: m?.leadCountNew ?? 0, sub: `Bugün yeni +${m?.leadCountNewToday ?? 0} · 30 günde ${m?.leadCount30Days ?? 0}`, icon: MessageSquare, href: "/business/leads", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        { id: "reviews", title: "Değerlendirmeler", value: m?.reviewCount ?? 0, sub: "Onaylı yorum", icon: Star, href: "/business/reviews", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
        { id: "views", title: "Profil Görünümü", value: m?.views30Days ?? 0, sub: "Son 30 gün", icon: Eye, href: "/business/analytics", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
        { id: "conversion", title: "Dönüşüm Oranı", value: `%${m?.conversionRate ?? 0}`, sub: "Ziyaret → Talep", icon: Target, href: "/business/analytics", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
        { id: "reservations", title: "Yeni Randevu Talebi", value: m?.pendingReservationCount ?? 0, sub: `Bugün +${m?.newReservationCountToday ?? 0}`, icon: CalendarDays, href: "/business/reservations", color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-100" },
    ];
    const cardsById = Object.fromEntries(statCardsRaw.map((c) => [c.id, c]));
    const orderedIds = Array.isArray(preferences?.order)
        ? preferences.order
              .slice()
              .sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0))
              .map((o) => o?.id)
              .filter(Boolean)
        : [];
    const allOrderedCards = orderedIds.map((id) => cardsById[id]).filter(Boolean);
    const statCards = allOrderedCards.filter((c) => !(preferences.hidden || []).includes(c.id));

    const handleDashboardDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const ids = allOrderedCards.map((c) => c.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newOrder = arrayMove(ids, oldIndex, newIndex).map((id, index) => ({ id, index }));
        updateOrder(newOrder);
        toast.success("Kart sırası güncellendi.");
    };

    return (
        <div className="space-y-12 pb-20 font-inter">
            <BroadcastSlot layout="BANNER" audience="BUSINESS" />
            {/* Tamamlama & Uyarılar */}
            {business.completion < 100 && (
                <OnboardingCompletion
                    score={business.completion}
                    pendingTasks={business.missingSteps || []}
                />
            )}

            {(m?.leadCountNew ?? 0) > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900">{m.leadCountNew} yeni hizmet talebi var</h3>
                            <p className="text-sm text-indigo-700">Yeni gelen talepleri inceleyip hızlıca teklif verin.</p>
                        </div>
                    </div>
                    <Link
                        href="/business/leads"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                    >
                        Taleplere Git
                    </Link>
                </div>
            )}

            {m?.missedLeadCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-900">{m.missedLeadCount} talep yanıt bekliyor</h3>
                            <p className="text-sm text-rose-700">30 dakikayı aşan yeni talepleri yanıtlayın.</p>
                        </div>
                    </div>
                    <Link
                        href="/business/leads"
                        className="px-6 py-3 bg-rose-600 text-white rounded-xl font-semibold text-sm hover:bg-rose-700 transition-colors"
                    >
                        Taleplere Git
                    </Link>
                </div>
            )}

            {(m?.pendingReservationCount ?? 0) > 0 && (
                <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center text-fuchsia-600">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-fuchsia-900">{m.pendingReservationCount} yeni randevu talebi var</h3>
                            <p className="text-sm text-fuchsia-700">Yeni gelen rezervasyon taleplerini onaylayın veya güncelleyin.</p>
                        </div>
                    </div>
                    <Link
                        href="/business/reservations"
                        className="px-6 py-3 bg-fuchsia-600 text-white rounded-xl font-semibold text-sm hover:bg-fuchsia-700 transition-colors"
                    >
                        Rezervasyonlara Git
                    </Link>
                </div>
            )}

            {/* Hero: İşletme adı + Profil & Abonelik */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 min-w-0">
                        {business.logoUrl ? (
                            <img
                                src={business.logoUrl}
                                alt={business.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                            />
                        ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                <BarChart3 className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">
                                {business.name}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-0.5">Panel özeti · Tüm parametreler</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-stretch gap-4">
                        <Link
                            href="/business/onboarding"
                            className="bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 px-5 py-4 flex items-center gap-4 transition-colors min-w-[140px]"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${business.completion === 100 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profil</p>
                                <p className="text-lg font-black text-slate-900">%{business.completion ?? 0}</p>
                            </div>
                        </Link>
                        <div className="w-full sm:w-auto sm:min-w-[240px]">
                            <DashboardSubscriptionWidget subscription={business.subscription} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Özet Kartlar */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#004aad]" />
                        İşletme Özeti
                    </h2>
                    <button
                        type="button"
                        onClick={() => setCustomizeMode((v) => !v)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${customizeMode ? "bg-[#004aad] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                        {customizeMode ? "Tamamla" : "Özelleştir"}
                    </button>
                </div>
                <DashboardCardsGrid
                    allOrderedCards={allOrderedCards}
                    statCards={statCards}
                    customizeMode={customizeMode}
                    preferences={preferences}
                    onDragEnd={handleDashboardDragEnd}
                    sensors={sensors}
                    toggleVisibility={toggleVisibility}
                />
            </section>

            {/* Referans */}
            {(m?.referralStats?.totalInvited > 0 || business.referralCode) && (
                <DashboardReferralCard
                    businessInfo={business}
                    referralStats={m.referralStats}
                />
            )}

            {/* Hızlı Erişim */}
            <section className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-700 mb-6">Hızlı Erişim</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/business/leads" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        <span className="font-semibold text-slate-800">Talepler</span>
                    </Link>
                    <Link href="/business/orders" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <ShoppingCart className="w-5 h-5 text-cyan-500" />
                        <span className="font-semibold text-slate-800">Siparişler</span>
                    </Link>
                    <Link href="/business/products" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <Package className="w-5 h-5 text-violet-500" />
                        <span className="font-semibold text-slate-800">Ürünler</span>
                    </Link>
                    <Link href="/business/analytics" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <TrendingUp className="w-5 h-5 text-teal-500" />
                        <span className="font-semibold text-slate-800">Analitik</span>
                    </Link>
                    <Link href="/business/settings/menu-customization" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <Settings className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-slate-800">Menü Özelleştirme</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
