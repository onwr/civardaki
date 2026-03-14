"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Shield,
    Globe,
    Bell,
    Lock,
    Save,
    Zap,
    Layout,
    Key
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [activeSubTab, setActiveSubTab] = useState("GENEL");
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/settings");
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) {
                throw new Error(json.error || "Ayarlar yüklenemedi.");
            }
            setSettings(json.settings || {});
        } catch (e) {
            const msg = e.message || "Ayarlar yüklenirken bir hata oluştu.";
            console.error(e);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const updateBlock = (block, field, value) => {
        setSettings(prev => {
            const prevBlock = prev && prev[block] ? prev[block] : {};
            return {
                ...(prev || {}),
                [block]: {
                    ...prevBlock,
                    [field]: value
                }
            };
        });
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!settings || saving) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings })
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) {
                const msg = json.error || "Ayarlar güncellenemedi.";
                setError(msg);
                toast.error(msg);
            } else {
                setSettings(json.settings || settings);
                setIsDirty(false);
                toast.success("Platform ayarları başarıyla kaydedildi.");
            }
        } catch (e) {
            const msg = e.message || "Ayarlar kaydedilirken bir hata oluştu.";
            console.error(e);
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const general = settings?.general || {};
    const api = settings?.api || {};
    const security = settings?.security || {};
    const notifications = settings?.notifications || {};

    if (loading) {
        return (
            <div className="space-y-10">
                <div className="h-24 w-3/4 bg-slate-100 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                    </div>
                    <div className="lg:col-span-9 h-[420px] bg-slate-50 rounded-[3rem] animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-16">

            {/* 1. HERO HEADER */}
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.2)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Sistem Konfigürasyonu</span>
                    </div>
                    <div>
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                            PLATFORM <br /> <span className="text-[#004aad]">AYARLARI</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
                            Platformun temel çalışma prensiplerini, güvenlik protokollerini ve entegrasyon ayarlarını bu merkezden yönetin.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {error && (
                        <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-[0.18em] max-w-xs text-right">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                            className={`px-10 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-4 italic group ${isDirty
                                ? "bg-[#004aad] text-white hover:bg-slate-900"
                                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                }`}
                        >
                            <Save className={`w-5 h-5 transition-transform ${saving ? "animate-spin" : "group-hover:rotate-12"}`} />{" "}
                            {saving ? "KAYDEDİLİYOR..." : isDirty ? "DEĞİŞİKLİKLERİ KAYDET" : "GÜNCEL"}
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. SETTINGS CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Sub-navigation Sidebar */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-[3rem] p-6 space-y-2 sticky top-36 shadow-sm">
                        {[
                            { id: "GENEL", label: "GENEL AYARLAR", icon: Globe },
                            { id: "API", label: "API & ENTEGRASYON", icon: Key }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSubTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all group ${activeSubTab === item.id
                                    ? "bg-[#004aad] text-white shadow-xl scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-950 hover:bg-slate-50"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeSubTab === item.id ? "text-white" : "group-hover:text-[#004aad]"}`} />
                                <span className="text-[10px] font-black tracking-widest uppercase italic">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Form Area */}
                <div className="lg:col-span-9">
                    <div className="bg-white border border-slate-100 rounded-[4rem] p-10 lg:p-16 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 text-[#004aad]">
                            <Settings className="w-60 h-60" />
                        </div>

                        <div className="relative z-10 space-y-12">
                            {/* GENEL */}
                            {activeSubTab === "GENEL" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-[#004aad] rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-blue-900/10">
                                            <Globe className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">TEMEL SİSTEM AYARLARI</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Platform Başlığı</label>
                                            <input
                                                type="text"
                                                value={general.platformName || ""}
                                                onChange={(e) => updateBlock("general", "platformName", e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-lg font-black italic text-slate-950 outline-none focus:border-[#004aad] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Destek E-Posta</label>
                                            <input
                                                type="email"
                                                value={general.supportEmail || ""}
                                                onChange={(e) => updateBlock("general", "supportEmail", e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-lg font-black italic text-slate-950 outline-none focus:border-[#004aad] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Platform Açıklaması (Meta Description)</label>
                                            <textarea
                                                rows={4}
                                                value={general.metaDescription || ""}
                                                onChange={(e) => updateBlock("general", "metaDescription", e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-lg font-black italic text-slate-950 outline-none focus:border-[#004aad] transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GÜVENLİK */}
                            {activeSubTab === "GUVENLIK" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-rose-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-rose-900/10">
                                            <Lock className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">GÜVENLİK PROTOKOLLERİ</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all">
                                            <div>
                                                <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">İki Faktörlü Doğrulama (Admin)</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Tüm yönetici paneli girişlerinde zorunlu 2FA.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateBlock("security", "adminTwoFactorRequired", !security.adminTwoFactorRequired)}
                                                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${security.adminTwoFactorRequired ? "bg-[#004aad]" : "bg-slate-300"}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${security.adminTwoFactorRequired ? "translate-x-6" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all">
                                            <div>
                                                <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">Oturum Zaman Aşımı</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Dakika cinsinden otomatik çıkış süresi.</p>
                                            </div>
                                            <input
                                                type="number"
                                                min={5}
                                                max={240}
                                                value={security.sessionTimeoutMinutes || ""}
                                                onChange={(e) => updateBlock("security", "sessionTimeoutMinutes", Number(e.target.value || 0))}
                                                className="w-24 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-right"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all">
                                            <div>
                                                <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">SSL Sertifikası Zorunlu</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Tüm platform trafiğini HTTPS üzerinden geçir.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateBlock("security", "forceHttps", !security.forceHttps)}
                                                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${security.forceHttps ? "bg-[#004aad]" : "bg-slate-300"}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${security.forceHttps ? "translate-x-6" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Giriş Deneme Limiti</p>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    value={security.loginAttemptLimit || ""}
                                                    onChange={(e) => updateBlock("security", "loginAttemptLimit", Number(e.target.value || 0))}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-black text-right"
                                                />
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Min. Şifre Uzunluğu</p>
                                                <input
                                                    type="number"
                                                    min={6}
                                                    max={64}
                                                    value={security.passwordMinLength || ""}
                                                    onChange={(e) => updateBlock("security", "passwordMinLength", Number(e.target.value || 0))}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-black text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BİLDİRİMLER */}
                            {activeSubTab === "BILDIRIM" && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-amber-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-amber-900/10">
                                            <Bell className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">BİLDİRİM MATRİSİ</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            {
                                                key: "emailNotificationsEnabled",
                                                title: "E-Posta Bildirimleri",
                                                desc: "Sistem genelinde kritik olaylarda e-posta bildirimi gönder."
                                            },
                                            {
                                                key: "adminTicketNotifications",
                                                title: "Destek Talepleri",
                                                desc: "Yeni destek talebi açıldığında admin ekibini bilgilendir."
                                            },
                                            {
                                                key: "leadNotifications",
                                                title: "Lead / Müşteri Talepleri",
                                                desc: "İşletmeler için üretilen yeni lead isteklerini bildir."
                                            },
                                            {
                                                key: "marketingNotifications",
                                                title: "Pazarlama Bildirimleri",
                                                desc: "Kampanya ve ürün duyurularında bildirim gönder."
                                            }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all">
                                                <div>
                                                    <p className="text-sm font-black text-slate-950 uppercase tracking-tighter">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">{item.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => updateBlock("notifications", item.key, !notifications[item.key])}
                                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${notifications[item.key] ? "bg-[#004aad]" : "bg-slate-300"}`}
                                                >
                                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications[item.key] ? "translate-x-6" : "translate-x-0"}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* API & ENTEGRASYON */}
                            {activeSubTab === "API" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                                            <Key className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                                            CIVARDAKI AI ENTEGRASYONU
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <div>
                                                <p className="text-sm font-black text-slate-950 uppercase tracking-tighter">
                                                    Yapay Zeka API Token
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
                                                    Civardaki AI servisleriyle entegrasyon için kullanılan gizli anahtar.
                                                </p>
                                            </div>
                                            <input
                                                type="password"
                                                value={api.civardakiAiApiKey || ""}
                                                onChange={(e) => updateBlock("api", "civardakiAiApiKey", e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black italic outline-none focus:border-[#004aad]"
                                                placeholder="********"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
