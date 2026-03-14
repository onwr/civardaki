"use client";

import Header from "@/components/layout/Header";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Check, ArrowRight, Sparkles, ShieldCheck, Zap,
    Mail, Phone, Lock, Building2, AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import GooglePlacesAutocomplete from "@/components/maps/GooglePlacesAutocomplete";

export default function QuickRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        businessName: "",
        category: "",
        phone: "",
        email: "",
        password: "",
        address: "",
        city: "",
        district: "",
        latitude: null,
        longitude: null
    });

    // Telemetry: Track page load
    useState(() => {
        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "CLICK_QUICK_REGISTER" })
        }).catch(() => { });
    });

    const handlePlaceSelected = (place) => {
        setFormData(prev => ({
            ...prev,
            ...place
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Telemetry: Track submission intent
        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "SUBMIT_QUICK_REGISTER" })
        }).catch(() => { });

        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) fd.append(key, value);
            });
            fd.append("registrationMode", "quick");

            const res = await fetch("/api/auth/register-business", {
                method: "POST",
                body: fd
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Bir hata oluştu.");
                setLoading(false);
                return;
            }

            // Telemetry: Track success
            fetch("/api/public/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "QUICK_REGISTER_SUCCESS" })
            }).catch(() => { });

            // Auto sign in
            const signInRes = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (signInRes?.error) {
                router.push("/user/login?msg=auto-login-failed");
                return;
            }

            router.push("/business/dashboard");
            router.refresh();

        } catch (err) {
            setError("Bağlantı hatası oluştu.");
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3.5 rounded-xl border-0 ring-1 ring-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 font-semibold transition-all duration-200 bg-white/50 hover:bg-white focus:bg-white outline-none";
    const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-1";

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Value Prop */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                                <Zap className="w-3 h-3 fill-current" />
                                30 Saniyede Başlat
                            </span>
                            <h1 className="mt-6 text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight italic uppercase">
                                İşletmeni <span className="text-blue-600">Hızlıca</span> Ekranlara Taşı
                            </h1>
                            <p className="mt-6 text-slate-500 font-bold text-lg leading-relaxed">
                                Google altyapısıyla bilgilerini saniyeler içinde çek, hemen müşteri almaya başla. 14 gün ücretsiz deneme fırsatını kaçırma.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {[
                                { icon: Check, text: "Google Maps verisiyle tek tuşla kayıt" },
                                { icon: ShieldCheck, text: "14 Gün ücretsiz tam panel erişimi" },
                                { icon: Sparkles, text: "Yapay zeka destekli profil tamamlama" }
                            ].map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * (i + 1) }}
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-700">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-200 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-bold text-slate-400 italic">
                                <span className="text-slate-900">+124 işletme</span> bugün katıldı
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 p-8 md:p-10 border border-slate-100 relative overflow-hidden"
                    >
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                            {error && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold flex gap-3 items-center animate-shake">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className={labelClass}>İşletme Adı & Konum</label>
                                <GooglePlacesAutocomplete onPlaceSelected={handlePlaceSelected} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Kategori</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={`${inputClass} pl-12 h-[58px] appearance-none`}
                                        >
                                            <option value="">Seçiniz...</option>
                                            <option value="Temizlik">Temizlik</option>
                                            <option value="Kombi">Kombi & Isıtma</option>
                                            <option value="Tesisatçı">Tesisatçı</option>
                                            <option value="Nakliyat">Nakliyat</option>
                                            <option value="Boya & Badana">Boya & Badana</option>
                                            <option value="Diger">Diğer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Telefon</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            placeholder="05XX XXX XX XX"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`${inputClass} pl-12`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>E-posta</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="ornek@isletme.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`${inputClass} pl-12`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Şifre</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`${inputClass} pl-12`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Kaydı Tamamla</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400 font-bold">
                                Kayıt olarak <Link href="/terms" className="text-blue-500 underline">Kullanım Koşullarını</Link> kabul etmiş olursunuz.
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                            <Link
                                href="/business/register"
                                className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                onClick={() => {
                                    fetch("/api/public/events", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ type: "CLICK_SWITCH_TO_DETAILED_REGISTER" })
                                    }).catch(() => { });
                                }}
                            >
                                Daha Detaylı Kayıt İstiyorum
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
