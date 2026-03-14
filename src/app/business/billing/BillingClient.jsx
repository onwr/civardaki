"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function BillingClient({ subscription, isExpiredParams }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRenew = async () => {
        setIsLoading(true);
        // SPRINT 10B-5: PayTR Init logic will go here
        setTimeout(() => {
            alert("Ödeme altyapısı (PayTR) hazırlık aşamasında.");
            setIsLoading(false);
        }, 1000);
    };

    if (!subscription) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl text-center">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Abonelik Bulunamadı</h1>
                    <p className="text-slate-500 font-semibold mb-8">
                        İşletme hesabınıza bağlı bir abonelik kaydı bulunamadı. Lütfen destek ekibiyle iletişime geçin.
                    </p>
                </div>
            </div>
        );
    }

    const { status, plan, expiresAt } = subscription;
    const isExpired = status === "EXPIRED" || new Date(expiresAt) < new Date();

    // Calculate remaining days if active/trial
    const daysLeft = Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-12 flex justify-center">
            <div className="w-full max-w-6xl space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
                            <CreditCard className="w-3.5 h-3.5" /> Fatura ve Abonelik
                        </div>
                        <h1 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                            Panel Kullanımı <br /><span className="text-blue-600">Aboneliği</span>
                        </h1>
                    </div>
                </div>

                {/* Expiry Warning */}
                {(isExpired || isExpiredParams) && (
                    <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 flex items-start gap-6">
                        <div className="w-14 h-14 bg-white text-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-rose-900 mb-2 tracking-tight">Panel Erişiminiz Kısıtlandı</h3>
                            <p className="text-rose-700/80 font-bold leading-relaxed max-w-3xl">
                                Abonelik (veya deneme) süreniz dolduğu için işletme paneline erişiminiz durdurulmuştur.
                                <br /><br />
                                <strong>Merak etmeyin!</strong> İşletme profiliniz, müşteri yorumlarınız ve SEO değeriniz yayında kalmaya devam ediyor.
                                Yeni talepleri görmek ve paneli kullanmak için aboneliğinizi yenileyebilirsiniz.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Status Card */}
                    <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-10 lg:p-14 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <ShieldCheck className="w-64 h-64" />
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl ${isExpired ? 'bg-rose-500 shadow-rose-500/20' :
                                status === 'TRIAL' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
                                }`}>
                                <Zap className="w-10 h-10 fill-current opacity-90" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Mevcut Durum</p>
                                <h2 className="text-4xl font-black text-slate-950 tracking-tighter italic">
                                    {isExpired ? 'SÜRE DOLDU' : status === 'TRIAL' ? 'DENEME SÜRÜMÜ' : 'AKTİF'}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kalan Süre</p>
                                <p className={`text-3xl font-black italic ${isExpired ? 'text-rose-500' : 'text-slate-900'}`}>
                                    {isExpired ? '0 Gün' : `${daysLeft} Gün`}
                                </p>
                                <p className="text-xs font-bold text-slate-500 mt-2">Bitiş: {new Date(expiresAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Türü</p>
                                <p className="text-3xl font-black text-slate-900 italic tracking-tighter">
                                    {plan === "BASIC" ? "Aylık Erişim" : plan}
                                </p>
                                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Tüm panel özellikleri
                                </p>
                            </div>
                        </div>

                        {/* Notification Email Box */}
                        {subscription.email && (
                            <div className="p-6 rounded-[1.5rem] bg-blue-50/50 border border-blue-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="text-sm text-slate-600">
                                    Abonelik ve sistem bildirimleri şu e-posta adresinize gönderilir: <br />
                                    <strong className="text-slate-900">{subscription.email}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Card */}
                    <div className="lg:col-span-4 bg-slate-950 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative z-10 w-full">
                            <h3 className="text-white text-2xl font-black tracking-tighter mb-4">Aboneliği Yenile</h3>
                            <div className="flex items-baseline justify-center gap-1 mb-8">
                                <span className="text-5xl font-black text-white italic">299</span>
                                <span className="text-xl font-bold text-slate-400">₺/ay</span>
                            </div>

                            <ul className="text-left space-y-4 mb-10 w-full px-4">
                                {['Sınırsız Talep (Lead) Yönetimi', 'Müşteri Yorum Modülü', 'Gelişmiş Analitik Raporu', 'Referans Büyüme Motoru'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleRenew}
                                disabled={isLoading}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/50"
                            >
                                {isLoading ? "Yönlendiriliyor..." : "ŞİMDİ YENİLE"}
                            </button>
                            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest">PayTR Altyapısı ile Güvenli Ödeme</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
