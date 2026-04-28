"use client";

import { Share2, Users, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function DashboardReferralCard({ businessInfo, referralStats }) {
    const [referralUrl, setReferralUrl] = useState("");

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";
        if (businessInfo?.referralCode) {
            setReferralUrl(`${baseUrl}/r/${businessInfo.referralCode}`);
        }
    }, [businessInfo?.referralCode]);

    const handleShare = () => {
        if (!businessInfo?.referralCode) {
            toast.error("Ortaklık kodunuz henüz oluşturulmamış.");
            return;
        }

        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug: businessInfo.slug,
                type: "CLICK_SHARE_REFERRAL"
            })
        }).catch(() => { });

        const msg = `Selam, biz civardaki.com'da işletmemizi açtık. Müşteriler bize buradan kolayca ulaşıyor.\n\nİstersen sen de işletmeni aşağıdaki linkten ücretsiz ekleyebilirsin:\n${referralUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[3.5rem] p-10 lg:p-14 border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
            <div className="absolute top-0 right-0 p-12 opacity-5">
                <Users className="w-40 h-40 text-indigo-900" />
            </div>

            <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                    <SparkleIcon className="w-4 h-4" /> Ortaklık · gelir
                </div>
                <h2 className="text-3xl font-black text-indigo-950 tracking-tighter leading-tight">
                    İşletmeni Paylaş, Ağı Büyüt!
                </h2>
                <p className="text-indigo-800/80 font-semibold leading-relaxed max-w-lg">
                    Civardaki'nin gücünü çevrendeki diğer esnaf ve işletme sahipleriyle paylaş. Onlar da dijitalde yerlerini alsın.
                </p>

                <div className="flex gap-4 pt-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-white flex-1 relative overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Davet Edilen</p>
                        <p className="text-3xl font-black text-indigo-950">{referralStats?.totalInvited || 0}</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-white flex-1 relative overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Aktif Olan</p>
                        <p className="text-3xl font-black text-emerald-950">{referralStats?.totalActive || 0}</p>
                        {(referralStats?.totalActive || 0) > 0 && <CheckCircle className="absolute bottom-4 right-4 w-6 h-6 text-emerald-500 opacity-20" />}
                    </div>
                </div>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center space-y-4">
                <button
                    onClick={handleShare}
                    className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3"
                >
                    <Smartphone className="w-5 h-5" /> WhatsApp ile Davet Et
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(referralUrl);
                        toast.success("Davet linki kopyalandı!");
                    }}
                    className="w-full md:w-auto px-10 py-5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-[2rem] font-black uppercase tracking-widest shadow-sm border border-indigo-100 transition-all flex items-center justify-center gap-3"
                >
                    <Share2 className="w-5 h-5" /> Linki Kopyala
                </button>
            </div>
        </div>
    );
}

function SparkleIcon(props) {
    return (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
        </svg>
    )
}
