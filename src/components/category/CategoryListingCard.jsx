"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Navigation, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { parseBusinessTags } from "@/lib/parse-business-tags";

const PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=80",
];

export default function CategoryListingCard({
    business,
    index = 0,
    viewMode = "grid",
    isFavorite = false,
    onFavoriteToggle,
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const image =
        business.coverUrl ||
        business.logoUrl ||
        PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
    const tags = parseBusinessTags(business.services, business.category, 3);
    const location = [business.district, business.city].filter(Boolean).join(", ");
    const distanceLabel =
        business.distanceText ||
        (business.distance != null
            ? business.distance < 1
                ? `${Math.round(business.distance * 1000)} m`
                : `${business.distance.toFixed(1)} km`
            : null);

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session?.user) {
            toast.info("Favorilere eklemek için giriş yapın");
            router.push("/user/login");
            return;
        }
        await onFavoriteToggle?.(business);
    };

    return (
        <article
            role="link"
            tabIndex={0}
            onClick={() => router.push(`/isletme/${business.slug}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/isletme/${business.slug}`);
            }}
            className={`group flex cursor-pointer overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${
                viewMode === "list" ? "flex-row" : "flex-col h-full"
            }`}
        >
            <div
                className={`relative shrink-0 overflow-hidden ${
                    viewMode === "list" ? "w-44 sm:w-52 min-h-[160px]" : "h-[180px] w-full"
                }`}
            >
                <img
                    src={image}
                    alt={business.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black shadow-md ${
                        business.isOpen
                            ? "bg-white text-emerald-600"
                            : "bg-white text-slate-500"
                    }`}
                >
                    {business.isOpen ? "AÇIK" : "KAPALI"}
                </div>
                {distanceLabel && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-700 shadow-md backdrop-blur">
                        <Navigation className="h-3.5 w-3.5 text-[#0057d9]" />
                        {distanceLabel}
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleFavorite}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-105"
                    aria-label="Favorilere ekle"
                >
                    <Heart
                        className={`h-4 w-4 ${
                            isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"
                        }`}
                    />
                </button>
            </div>

            <div className={`flex flex-1 flex-col p-4 ${viewMode === "list" ? "min-w-0" : ""}`}>
                <p className="line-clamp-1 text-xs font-black uppercase tracking-wide text-[#0057d9]">
                    {business.category || "İşletme"}
                </p>
                <h3 className="mt-1 line-clamp-1 text-lg font-black text-slate-950 group-hover:text-[#0057d9]">
                    {business.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-black text-slate-900">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {business.reviewCount > 0
                            ? Number(business.rating).toFixed(1)
                            : "Yeni"}
                        {business.reviewCount > 0 && (
                            <span className="text-xs font-semibold text-slate-400">
                                ({business.reviewCount})
                            </span>
                        )}
                    </span>
                    {location && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-1">{location}</span>
                        </span>
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex gap-2 pt-4">
                    {business.productsCount > 0 ? (
                        <Link
                            href={`/isletme/${business.slug}#urunler`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-black text-slate-700 transition hover:border-[#0057d9] hover:text-[#0057d9]"
                        >
                            Menü
                        </Link>
                    ) : (
                        <span className="flex-1 rounded-xl border border-slate-100 py-2.5 text-center text-xs font-black text-slate-300">
                            Menü
                        </span>
                    )}
                    <Link
                        href={`/isletme/${business.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded-xl bg-[#0057d9] py-2.5 text-center text-xs font-black text-white transition hover:bg-[#004cc2]"
                    >
                        Teklif Al
                    </Link>
                </div>
            </div>
        </article>
    );
}
