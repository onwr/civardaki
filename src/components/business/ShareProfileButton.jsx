"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareProfileButton({ business }) {
    const handleShare = () => {
        if (!business?.slug) return;

        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug: business.slug,
                type: "CLICK_SHARE_PROFILE"
            })
        }).catch(() => { });

        const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com"}/business/${business.slug}`;
        const ratingText = business.ratingSum > 0 && business.responseCount > 0
            ? `⭐ ${Number(business.ratingSum / business.responseCount).toFixed(1)} puana sahip `
            : "";

        const responseText = business.avgResponseMinutes > 0
            ? `ve genelde ${Math.ceil(business.avgResponseMinutes)}dk içinde cevap veriyor. `
            : "";

        const msg = `${business.name} işletmesine göz at!\n\n${ratingText}${responseText}\n\nDetaylar burada:\n${profileUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-100 transition-colors"
        >
            <Share2 className="w-4 h-4" />
            Profili WhatsApp İle Paylaş
        </button>
    );
}
