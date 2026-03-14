"use client";

import { MessageCircle, Star } from "lucide-react";
import { toast } from "sonner";

export default function ReviewRequestButton({ businessInfo }) {
    const handleRequestReview = () => {
        if (!businessInfo?.slug) {
            toast.error("İşletme bilgisi bulunamadı.");
            return;
        }

        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug: businessInfo.slug,
                type: "CLICK_REQUEST_REVIEW"
            })
        }).catch(() => { });

        const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com"}/business/${businessInfo.slug}#reviews`;
        const msg = `Merhaba,\n\n${businessInfo.name} olarak sunduğumuz hizmetten memnun kaldıysan, Civardaki üzerinden bize bir değerlendirme bırakabilir misin?\n\n⭐ Yorum bırakmak için tıkla:\n${reviewUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <button
            onClick={handleRequestReview}
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 fill-current" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Müşterilerden<br />Yorum İste</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                </p>
            </div>
        </button>
    );
}
