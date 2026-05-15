"use client";

import Image from "next/image";
import {
    Building2,
    Star,
    MessageSquare,
    Layers,
    Share2,
    Heart,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryIconVisual } from "@/lib/category-icon";

const SAVED_CATEGORIES_KEY = "civardaki_saved_categories";

function getCategoryEmoji(name = "") {
    const n = name.toLowerCase();
    if (n.includes("restoran") || n.includes("yeme")) return "🍽️";
    if (n.includes("güzellik")) return "💇";
    if (n.includes("oto")) return "🚗";
    if (n.includes("temizlik")) return "🧹";
    return "🏪";
}

function formatCount(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k+`;
    return `${n}+`;
}

export default function CategoryHero({
    displayName,
    parentLabel,
    description,
    imageUrl,
    icon,
    color,
    stats,
    categorySlug,
}) {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SAVED_CATEGORIES_KEY);
            const list = raw ? JSON.parse(raw) : [];
            setSaved(Array.isArray(list) && list.some((s) => s.slug === categorySlug));
        } catch {
            setSaved(false);
        }
    }, [categorySlug]);

    const handleShare = useCallback(async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const title = `${displayName} | Civardaki`;
        try {
            if (navigator.share) {
                await navigator.share({ title, text: description, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success("Link panoya kopyalandı");
        } catch {
            /* cancelled */
        }
    }, [displayName, description]);

    const handleSaveCategory = useCallback(() => {
        try {
            const raw = localStorage.getItem(SAVED_CATEGORIES_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const arr = Array.isArray(list) ? list : [];
            const next = saved
                ? arr.filter((s) => s.slug !== categorySlug)
                : [
                      ...arr.filter((s) => s.slug !== categorySlug),
                      { slug: categorySlug, name: displayName, savedAt: Date.now() },
                  ];
            localStorage.setItem(SAVED_CATEGORIES_KEY, JSON.stringify(next));
            setSaved(!saved);
            toast.success(saved ? "Favorilerden kaldırıldı" : "Favorilere eklendi");
        } catch {
            toast.error("Kaydedilemedi");
        }
    }, [saved, categorySlug, displayName]);

    const accent = color || "#f97316";
    const statItems = [
        { icon: Building2, label: formatCount(stats.businessCount), sub: "İşletme" },
        {
            icon: Star,
            label: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
            sub: "Ortalama Puan",
        },
        {
            icon: MessageSquare,
            label: formatCount(stats.totalReviews),
            sub: "Yorum",
        },
        {
            icon: Layers,
            label: String(stats.subcategoryCount),
            sub: "Alt Kategori",
        },
    ];

    return (
        <section className="relative mx-4 sm:mx-6 lg:mx-auto container mt-2 overflow-hidden rounded-[32px] border border-slate-200/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
            <div className="absolute inset-0">
                {imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt=""
                            fill
                            className="object-cover scale-105"
                            priority
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                        <HeroBgOverlay />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

            <HeroBody
                displayName={displayName}
                parentLabel={parentLabel}
                description={description}
                icon={icon}
                imageUrl={imageUrl}
                accent={accent}
                emoji={getCategoryEmoji(displayName)}
                statItems={statItems}
                onShare={handleShare}
                onSave={handleSaveCategory}
                saved={saved}
            />
        </section>
    );
}

function HeroBgOverlay() {
    return <div className="absolute inset-0 bg-slate-950/5 backdrop-blur-[2px]" />;
}

function HeroBody({
    displayName,
    parentLabel,
    description,
    icon,
    imageUrl,
    accent,
    emoji,
    statItems,
    onShare,
    onSave,
    saved,
}) {
    return (
        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 md:p-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <div className="flex items-start gap-4">
                    <HeroIconBox
                        icon={icon}
                        imageUrl={imageUrl}
                        emoji={emoji}
                        accent={accent}
                    />
                    <HeroTitle displayName={displayName} parentLabel={parentLabel} />
                </div>
                <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                    {description}
                </p>
                <div className="mt-6 flex flex-wrap gap-6 sm:gap-8">
                    {statItems.map((item) => (
                        <div key={item.sub} className="flex items-center gap-2">
                            <item.icon className="h-5 w-5 text-white/70" />
                            <div>
                                <p className="text-lg font-black text-white">{item.label}</p>
                                <p className="text-xs font-semibold text-slate-400">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                    <Share2 className="h-4 w-4" />
                    Paylaş
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100"
                >
                    <Heart
                        className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                    {saved ? "Favorilerde" : "Favorilere Ekle"}
                </button>
            </div>
        </div>
    );
}

function HeroIconBox({ icon, imageUrl, emoji, accent }) {
    return (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
            <CategoryIconVisual
                icon={icon}
                imageUrl={imageUrl}
                emoji={emoji}
                accent={accent}
                className="h-8 w-8"
                imageClassName="h-full w-full object-cover"
            />
        </div>
    );
}

function HeroTitle({ displayName, parentLabel }) {
    return (
        <div>
            {parentLabel && (
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                    {parentLabel}
                </span>
            )}
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                {displayName}
            </h1>
        </div>
    );
}
