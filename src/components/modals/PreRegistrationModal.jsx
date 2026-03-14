"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Instagram, Mail, Phone, User, Building2, UserCircle2, ArrowRight, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function PreRegistrationModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userType: "",
        firstName: "",
        lastName: "",
        instagram: "",
        email: "",
        phone: "",
        kvkk: false,
        communicationPermission: false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userType) { toast.error("Lütfen bir kullanıcı tipi seçin."); return; }
        if (!formData.kvkk) { toast.error("KVKK metnini kabul etmelisiniz."); return; }
        setLoading(true);
        try {
            await addDoc(collection(db, "pre_registrations"), { ...formData, createdAt: serverTimestamp() });
            toast.success("Ön kaydınız başarıyla alındı. Teşekkür ederiz!");
            onClose();
            setFormData({ userType: "", firstName: "", lastName: "", instagram: "", email: "", phone: "", kvkk: false, communicationPermission: false });
        } catch (error) {
            console.error("Firebase save error:", error);
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const userTypes = [
        { id: "customer", title: "Müşteri", description: "Hizmet Alımı", icon: UserCircle2 },
        { id: "individual_provider", title: "Bireysel", description: "Hizmet Ver", icon: User },
        { id: "business", title: "İşletme", description: "Ticari Kayıt", icon: Building2 }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white md:overflow-hidden overflow-y-auto"
                >
                    <button onClick={onClose} className="fixed top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-[110]">
                        <X className="w-5 h-5 text-gray-800" />
                    </button>

                    <div className="md:h-screen flex flex-col md:flex-row">
                        {/* Left Side */}
                        <div className="w-full md:w-[35%] bg-[#004aad] p-8 md:p-12 text-white flex flex-col justify-center">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                                <img src="/logo.png" alt="Civardaki" className="w-60 brightness-0 invert" />
                                <div className="space-y-2">
                                    <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
                                        ÖN KAYIT <br /> <span className="text-blue-300">FORMU</span>
                                    </h1>
                                </div>
                                <div className="space-y-4 pt-4">
                                    {["Hızlı Erişim", "Özel Fırsatlar", "Erken Erişim"].map((text) => (
                                        <div key={text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <p className="font-bold italic uppercase tracking-wider text-[10px]">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Side */}
                        <div className="w-full md:w-[65%] p-6 md:p-10 bg-gray-50 flex flex-col justify-center">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-xl w-full mx-auto">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-2">Kullanıcı Tipi *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {userTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, userType: type.id })}
                                                    className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${formData.userType === type.id ? "bg-white border-[#004aad] shadow-lg" : "bg-white border-transparent hover:border-gray-200"
                                                        }`}
                                                >
                                                    <type.icon className={`w-6 h-6 mb-2 ${formData.userType === type.id ? "text-[#004aad]" : "text-gray-300"}`} />
                                                    <h4 className="text-sm font-black text-gray-900 italic tracking-tighter leading-none">{type.title}</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase italic mt-1 tracking-widest">{type.description}</p>
                                                    {formData.userType === type.id && (
                                                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#004aad] rounded-full flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: "Ad *", field: "firstName", placeholder: "Adınız", icon: User },
                                            { label: "Soyad *", field: "lastName", placeholder: "Soyadınız", icon: User },
                                            { label: "Instagram *", field: "instagram", placeholder: "kullaniciadi", icon: Instagram, prefix: "@" },
                                            { label: "E-posta *", field: "email", placeholder: "ornek@email.com", icon: Mail }
                                        ].map((input) => (
                                            <div key={input.field} className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-2">{input.label}</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#004aad] transition-colors">
                                                        <input.icon className="w-4 h-4" />
                                                    </div>
                                                    {input.prefix && <span className="absolute left-10 top-1/2 -translate-y-1/2 font-black text-gray-300 italic text-sm">{input.prefix}</span>}
                                                    <input
                                                        required
                                                        type={input.field === "email" ? "email" : "text"}
                                                        placeholder={input.placeholder}
                                                        value={formData[input.field]}
                                                        onChange={(e) => setFormData({ ...formData, [input.field]: e.target.value })}
                                                        className={`w-full ${input.prefix ? "pl-14" : "pl-10"} pr-4 py-2.5 bg-white rounded-2xl border border-transparent shadow-sm focus:border-[#004aad] outline-none font-bold text-gray-900 italic text-sm`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-2">Telefon *</label>
                                        <div className="relative group flex gap-2">
                                            <div className="relative flex-none w-24">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input readOnly value="+90" className="w-full pl-10 pr-2 py-2.5 bg-white rounded-2xl border border-transparent shadow-sm outline-none font-bold text-gray-900 italic text-sm" />
                                            </div>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="5XX XXX XX XX"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="flex-1 px-4 py-2.5 bg-white rounded-2xl border border-transparent shadow-sm focus:border-[#004aad] outline-none font-bold text-gray-900 italic text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        <label className="flex items-center gap-3 p-3 bg-white rounded-2xl cursor-pointer group border border-transparent hover:border-gray-200 transition-all">
                                            <input type="checkbox" className="hidden" checked={formData.kvkk} onChange={(e) => setFormData({ ...formData, kvkk: e.target.checked })} />
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.kvkk ? "bg-[#004aad] border-[#004aad]" : "border-gray-200"}`}>
                                                {formData.kvkk && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-900 italic uppercase leading-none">KVKK Aydınlatma Metni *</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 bg-white rounded-2xl cursor-pointer group border border-transparent hover:border-gray-200 transition-all">
                                            <input type="checkbox" className="hidden" checked={formData.communicationPermission} onChange={(e) => setFormData({ ...formData, communicationPermission: e.target.checked })} />
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.communicationPermission ? "bg-[#004aad] border-[#004aad]" : "border-gray-200"}`}>
                                                {formData.communicationPermission && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-900 italic uppercase leading-none">İletişim İzni</p>
                                            </div>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#004aad] text-white py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ÖN KAYIT YAP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
