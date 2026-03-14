"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function LeadForm({
    businessSlug,
    businessName,
    businessPhone,
    defaultOpen = false,
    productContext = null,
    avgResponseMinutes = 0,
    defaultCategory = "",
    defaultCategoryId = "",
    defaultCategorySlug = "",
    defaultCity = "",
    defaultDistrict = "",
    sourcePage = "",
}) {
    const wrapRef = useRef(null);

    const [step, setStep] = useState(1); // SPRINT 9I: micro-commitment
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState(defaultCategory || "");
    const [message, setMessage] = useState("");
    const [honeypot, setHoneypot] = useState("");

    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (defaultOpen && wrapRef.current) {
            wrapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [defaultOpen]);

    useEffect(() => {
        if (defaultCategory) {
            setCategory(defaultCategory);
        }
    }, [defaultCategory]);

    // When product context is set (from catalog CTA), prefill message and scroll
    useEffect(() => {
        if (productContext?.prefillMessage) {
            setMessage(productContext.prefillMessage);
            setStep(2); // Auto-advance to step 2 if product clicked
            if (wrapRef.current) {
                wrapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [productContext]);

    const handleNextStep = () => {
        setErr("");
        if (!name.trim() || (!phone.trim() && !email.trim())) {
            setErr("Ad ve (telefon veya e-posta) zorunlu.");
            return;
        }
        setStep(2);
    };

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setOk(false);

        if (!businessSlug || !name.trim() || !message.trim() || (!phone.trim() && !email.trim())) {
            setErr("Ad, mesaj ve (telefon veya e-posta) zorunlu.");
            return;
        }

        if (message.trim().length < 5) {
            setErr("Mesajınız çok kısa.");
            return;
        }

        if (message.trim().length > 1000) {
            setErr("Mesajınız en fazla 1000 karakter olabilir.");
            return;
        }

        // Anti-SPAM honeypot: Silent swallow
        if (honeypot) {
            console.warn("Honeypot triggered, swallowing request.");
            setOk(true);
            setStep(1);
            setName("");
            setPhone("");
            setEmail("");
            setCategory("");
            setMessage("");
            setHoneypot("");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/public/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessSlug,
                    name: name.trim(),
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                    message: message.trim(),
                    category: category.trim() || null,
                    categoryId: defaultCategoryId || null,
                    categorySlug: defaultCategorySlug || null,
                    productId: productContext?.productId || null,
                    source: productContext?.productId ? "PRODUCT" : "BUSINESS_PAGE",
                    city: defaultCity || null,
                    district: defaultDistrict || null,
                    sourcePage: sourcePage || null,
                    _honeypot: honeypot,
                    fingerprint: window?.crypto?.randomUUID ? window.crypto.randomUUID() : null // Simple session fingerprint placeholder
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Talep gönderilemedi.");

            setOk(true);
            setStep(1);
            setName("");
            setPhone("");
            setEmail("");
            setCategory("");
            setMessage("");
            setHoneypot("");
        } catch (e2) {
            setErr(e2.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // SPRINT 9B: Telemetry Tracking
    const handleWhatsAppClick = () => {
        fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                businessSlug,
                type: "CLICK_WHATSAPP",
                productId: productContext?.productId || null
            })
        }).catch(() => { });

        // Then open normal WhatsApp URL
        const phone = businessPhone || "";
        const cleaned = phone.replace(/[^0-9]/g, "");
        if (!cleaned) {
            toast.error("Bu işletmenin WhatsApp numarası bulunamadı.");
            return;
        }
        const tr = cleaned.startsWith("0") ? "90" + cleaned.slice(1) : (cleaned.startsWith("90") ? cleaned : "90" + cleaned);
        const msg = productContext?.productName
            ? `Merhaba, ${productContext.productName} hakkında bilgi almak istiyorum.`
            : `Merhaba, hizmetleriniz hakkında bilgi almak istiyorum.`;
        window.open(`https://wa.me/${tr}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    return (
        <div ref={wrapRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-950">Talep Bırak</h3>
                    <p className="mt-1 text-slate-500 font-semibold text-sm">
                        <span className="text-slate-900">{businessName}</span> ile iletişime geç.
                    </p>
                    {productContext?.productName && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                            Ürün: {productContext.productName}
                        </div>
                    )}
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-widest">
                    MVP
                </div>
            </div>

            {/* SPRINT 9I: Lead Urgency Signal */}
            {avgResponseMinutes > 0 && avgResponseMinutes <= 120 && !ok && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-bold text-emerald-700">
                        Bu işletme genelde <span className="font-black text-emerald-600">{Math.ceil(avgResponseMinutes)} dk</span> içinde cevap verir.
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                {ok ? (
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-3 rounded-2xl">
                            <CheckCircle className="h-5 w-5" />
                            Talebiniz başarıyla iletildi.
                        </div>
                        {businessPhone && (
                            <a
                                href={`https://wa.me/${businessPhone.replace(/[^0-9]/g, '')}?text=Merhaba,%20size%20civardaki.com%20uzerinden%20talep%20biraktim.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-[#20bd5aa0] transition-colors"
                            >
                                WhatsApp İle Devam Et
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => { setOk(false); setStep(1); setCategory(""); setMessage(""); }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-600 hover:bg-slate-200"
                        >
                            Yeni Talep Gönder
                        </button>
                    </div>
                ) : step === 1 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ad Soyad *"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Telefon (opsiyonel)"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900"
                            />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-posta (opsiyonel)"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#004aad] px-4 py-4 font-black uppercase tracking-widest text-[#ffffff] transition-all hover:bg-slate-900 shadow-lg shadow-blue-500/20 text-xs mt-4"
                        >
                            Devam Et <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-wrap gap-2 mb-2 mt-4">
                            {["Fiyat Teklifi", "Randevu Al", "Detaylı Bilgi", "Şikayet/Öneri"].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setCategory(t)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${category === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Konu/Kategori (örn: fiyat teklifi)"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900"
                        />
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Mesajınız *"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 resize-none text-slate-900"
                        />
                        <input
                            type="text"
                            value={honeypot}
                            onChange={e => setHoneypot(e.target.value)}
                            className="hidden"
                            name="_honeypot"
                            tabIndex="-1"
                            autoComplete="off"
                        />

                        {err && (
                            <div className="flex items-center gap-2 text-sm font-bold text-rose-600 mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                {err}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-4 font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 text-xs w-28"
                            >
                                Geri
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#004aad] px-4 py-4 font-black uppercase tracking-widest text-[#ffffff] transition-all hover:bg-slate-900 disabled:opacity-70 shadow-lg shadow-blue-500/20 text-xs"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                TALEBİ GÖNDER
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <div className="mt-4 flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">VEYA</span>
                <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <button
                type="button"
                onClick={handleWhatsAppClick}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 font-black uppercase tracking-widest text-white transition-all hover:bg-[#1ebe5a] shadow-lg shadow-[#25D366]/20 text-xs"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WHATSAPP İLE YAZ
            </button>
        </div>
    );
}
