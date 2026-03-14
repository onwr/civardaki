"use client";

import { useState, useEffect } from "react";
import CatalogSection from "@/components/business/CatalogSection";
import LeadForm from "@/components/business/LeadForm";
import PublicReviewSection from "@/components/business/PublicReviewSection";
import ShareProfileButton from "@/components/business/ShareProfileButton";
import GallerySlider from "@/components/business/GallerySlider";
import ServicesList from "@/components/business/ServicesList";
import WorkingHours from "@/components/business/WorkingHours";
import BottomSheet from "@/components/ui/BottomSheet";
import { Zap, Clock, MapPin, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateDistance } from "@/lib/geo";

export default function BusinessDetailClient({ business, catalogData }) {
    const [productContext, setProductContext] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isLeadSheetOpen, setIsLeadSheetOpen] = useState(false);
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }, () => { });
        }
    }, []);

    useEffect(() => {
        if (userLocation && business.latitude && business.longitude) {
            const dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                business.latitude,
                business.longitude
            );
            setDistance(dist);
        }
    }, [userLocation, business.latitude, business.longitude]);

    // SPRINT 9B: Telemetry Tracking
    const trackEvent = (type, productId = null) => {
        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug: business.slug,
                type,
                productId
            })
        }).catch(() => { }); // Fire and forget safely
    };

    // Track Profile View on load
    useEffect(() => {
        if (business?.slug) {
            trackEvent("VIEW_PROFILE");
        }
    }, [business?.slug]);

    // SPRINT 9I: Heatmap-ready Telemetry (SCROLL_75)
    useEffect(() => {
        let hasFired = false;
        const handleScroll = () => {
            if (hasFired) return;
            const scrollPos = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollPercent = (scrollPos + windowHeight) / docHeight;

            if (scrollPercent >= 0.75) {
                trackEvent("SCROLL_75");
                hasFired = true;
                window.removeEventListener("scroll", handleScroll);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [business?.slug]);

    const handleLeadWithProduct = (ctx) => {
        setProductContext(ctx);
        if (window.innerWidth < 1024) {
            setIsLeadSheetOpen(true);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* SPRINT 11G: Floating Social Proof */}
            <AnimatePresence>
                {business.recentLeadCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 lg:bottom-10 left-6 z-40"
                    >
                        <div className="bg-white/90 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sosyal Kanıt</p>
                                <p className="text-xs font-black text-slate-900 mt-1 italic">
                                    Son 24 saatte <span className="text-blue-600 font-black">{business.recentLeadCount}</span> kişi ulaştı
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Column: Media + Services + Details */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-6">

                {/* 11G: Gallery Slider */}
                {business.gallery?.length > 0 && (
                    <GallerySlider images={business.gallery} />
                )}

                {/* SPRINT 11G: High-Conversion Trust Bar */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                    <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-4">İşletme Özeti</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-x divide-slate-100">
                        <div className="flex flex-col items-center justify-center text-center px-2">
                            <span className="text-amber-500 text-lg mb-1">⭐</span>
                            <span className="text-xl font-black text-slate-900">{business.rating > 0 ? Number(business.rating).toFixed(1) : "-"}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Ort. Puan</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center px-2">
                            <Zap className={`w-5 h-5 mb-1 ${business.avgResponseMinutes > 0 && business.avgResponseMinutes < 60 ? 'text-emerald-500 fill-current' : 'text-slate-400'}`} />
                            <span className="text-xl font-black text-slate-900">{business.avgResponseMinutes > 0 ? `${Math.ceil(business.avgResponseMinutes)}dk` : "-"}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Yanıt Süresi</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center px-2">
                            {distance ? (
                                <>
                                    <MapPin className="w-5 h-5 mb-1 text-rose-500 fill-rose-500/20" />
                                    <span className="text-xl font-black text-slate-900">{distance.toFixed(1)}km</span>
                                    <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Mesafe</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-blue-500 text-lg mb-1">🔥</span>
                                    <span className="text-xl font-black text-slate-900">{business.recentLeadCount || 0}</span>
                                    <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">24s Talep</span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center text-center px-2">
                            <span className="relative flex h-3 w-3 mb-2 mt-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-black text-slate-900">Aktif</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Profil</span>
                        </div>
                    </div>
                </div>

                {/* SPRINT 11G: Services & Working Hours Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.services && (
                        <ServicesList
                            services={business.services}
                            onCTA={() => {
                                trackEvent("CLICK_CTA_SECONDARY");
                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }}
                        />
                    )}
                    {business.workingHours && <WorkingHours hours={business.workingHours} />}
                </div>

                {/* About Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight italic">Hakkında</h2>
                    <p className="mt-4 text-slate-600 font-semibold leading-relaxed">
                        {business.description || "İşletme henüz detaylı açıklama eklemedi."}
                    </p>
                </div>

                {/* Catalog (Products) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <CatalogSection
                        catalogData={catalogData}
                        businessSlug={business.slug}
                        onLeadWithProduct={handleLeadWithProduct}
                    />
                </div>

                {/* Contact & Share */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight italic">İletişim Bilgileri</h2>
                            <p className="text-xs font-bold text-slate-400 mt-1">İşletme ile doğrudan iletişime geçin</p>
                        </div>

                        {business.phone && (
                            <a
                                href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent("CLICK_WHATSAPP")}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.853.448-1.273.607-1.446.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.274.072.376-.043l.433-.506c.101-.115.202-.086.346-.029.144.058.91.43 1.069.515.159.087.26.129.297.19.037.062.037.357-.107.762z" />
                                </svg>
                                WhatsApp'tan Yaz
                            </a>
                        )}
                    </div>

                    <div className="space-y-3 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-slate-400 font-black uppercase text-[10px]">Telefon</span>
                            {business.phone ? (
                                <a
                                    href={`tel:${business.phone}`}
                                    onClick={() => trackEvent("CLICK_PHONE")}
                                    className="text-slate-950 hover:text-blue-600 underline decoration-blue-500/30 underline-offset-4"
                                >
                                    {business.phone}
                                </a>
                            ) : "—"}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-slate-400 font-black uppercase text-[10px]">E-posta</span>
                            <span className="text-slate-950">{business.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-slate-400 font-black uppercase text-[10px]">Website</span>
                            <span className="text-slate-950">{business.website || "—"}</span>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-50 pt-6">
                        <ShareProfileButton business={business} />
                    </div>
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <PublicReviewSection
                        businessId={business.id}
                        businessSlug={business.slug}
                        rating={business.rating}
                        reviewCount={business.reviewCount}
                    />
                </div>
            </div>

            {/* Right Column: Lead Form (Sticky) */}
            <div className="lg:col-span-12 xl:col-span-4 relative">
                <div className="xl:sticky xl:top-6">
                    <LeadForm
                        businessSlug={business.slug}
                        businessName={business.name}
                        businessPhone={business.phone}
                        productContext={productContext}
                        avgResponseMinutes={business.avgResponseMinutes}
                        defaultCategory={business.primaryCategory?.name || business.category || ""}
                        defaultCategoryId={business.primaryCategory?.id || ""}
                        defaultCategorySlug={business.primaryCategory?.slug || ""}
                        defaultCity={business.city || ""}
                        defaultDistrict={business.district || ""}
                        sourcePage={`/business/${business.slug}`}
                    />
                </div>
            </div>

            {/* SPRINT 13A: Mobile Bottom Sheet for Leads */}
            <BottomSheet
                isOpen={isLeadSheetOpen}
                onClose={() => setIsLeadSheetOpen(false)}
                title="Teklif Al"
            >
                <div className="pb-20">
                    <LeadForm
                        businessSlug={business.slug}
                        businessName={business.name}
                        businessPhone={business.phone}
                        productContext={productContext}
                        avgResponseMinutes={business.avgResponseMinutes}
                        defaultCategory={business.primaryCategory?.name || business.category || ""}
                        defaultCategoryId={business.primaryCategory?.id || ""}
                        defaultCategorySlug={business.primaryCategory?.slug || ""}
                        defaultCity={business.city || ""}
                        defaultDistrict={business.district || ""}
                        sourcePage={`/business/${business.slug}`}
                    />
                </div>
            </BottomSheet>

            {/* SPRINT 9I: Sticky Mobile CTAs */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 lg:hidden z-50 flex gap-2">
                <button
                    onClick={() => {
                        trackEvent("CLICK_CTA_PRIMARY");
                        setIsLeadSheetOpen(true);
                    }}
                    className="flex-1 rounded-2xl bg-slate-950 px-4 py-4 font-black uppercase tracking-widest text-[#ffffff] shadow-lg text-xs flex justify-center items-center"
                >
                    Fiyat Teklifi Al
                </button>
                {business.phone && (
                    <a
                        href={`tel:${business.phone}`}
                        onClick={() => trackEvent("CLICK_PHONE_STICKY")}
                        className="flex-1 rounded-2xl bg-emerald-600 px-4 py-4 font-black uppercase tracking-widest text-[#ffffff] shadow-lg text-xs flex justify-center items-center gap-2"
                    >
                        Hemen Ara
                    </a>
                )}
            </div>
        </div>
    );
}
