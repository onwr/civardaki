"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Smartphone,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// Validation & Formatting Functions
const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
};

const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 && cleaned.startsWith("5");
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

const validateName = (name) => {
    return name.trim().length >= 3 && name.trim().split(" ").length >= 2;
};

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        terms: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!validateName(formData.name)) {
            newErrors.name = "En az 3 karakter ve ad-soyad gerekli";
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = "Geçerli bir e-posta adresi girin";
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = "Geçerli bir Türk telefon numarası girin";
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = "Şifre en az 8 karakter olmalı";
        }

        if (!formData.terms) {
            newErrors.terms = "Üyelik sözleşmesini kabul etmelisiniz";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
        if (errors.phone) {
            setErrors({ ...errors, phone: "" });
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSuccessMessage("");

        try {
            const res = await fetch("/api/auth/register-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone.replace(/\D/g, ""),
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ submit: data.message || "Kayıt olurken bir hata oluştu." });
            } else {
                setSuccessMessage("✅ Hesap başarıyla oluşturuldu! Yönlendiriliyorsunuz...");

                // Kayıt başarılı, login ol
                const loginRes = await signIn("credentials", {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                if (loginRes?.error) {
                    setTimeout(() => {
                        router.push("/user/login");
                    }, 2000);
                } else {
                    setTimeout(() => {
                        router.push("/");
                        router.refresh();
                    }, 2000);
                }
            }
        } catch (error) {
            setErrors({ submit: "Sunucu ile iletişim kurulamadı. Lütfen tekrar deneyin." });
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-slate-200 border-t-[#004aad] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">Yukleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex font-inter bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Left Side - Form Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-[520px] xl:w-[600px] flex flex-col justify-center px-6 sm:px-10 lg:px-16 relative z-10 bg-white lg:bg-transparent"
            >
                {/* Logo */}
                <div className="mb-12 flex justify-start">
                    <Link href="/">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-r from-[#004aad] to-blue-600 px-4 py-3 rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
                        >
                            <img
                                src="/logo.png"
                                className="h-8 w-auto object-contain brightness-0 invert"
                                alt="Civardaki Logo"
                            />
                        </motion.div>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black text-slate-900 mb-3"
                    >
                        Aramıza Katıl! 🚀
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 font-semibold"
                    >
                        Şehrin ayrıcalıklarını yakalamak için hemen üye ol.
                    </motion.p>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                        >
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm font-semibold text-green-800">{successMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {errors.submit && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm font-semibold text-red-800">{errors.submit}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name & Phone Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                                Ad Soyad
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004aad] transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Adınız Soyadınız"
                                    className={`w-full h-12 pl-12 pr-4 bg-slate-50 border-2 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all ${errors.name
                                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                        : "border-slate-200 focus:bg-white focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10"
                                        }`}
                                    value={formData.name}
                                    onChange={(e) => handleFieldChange("name", e.target.value)}
                                />
                                {errors.name && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-red-600 font-semibold mt-1 ml-1"
                                    >
                                        {errors.name}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>

                        {/* Phone Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                                Telefon
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004aad] transition-colors">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="(541) 234 56 78"
                                    maxLength="16"
                                    className={`w-full h-12 pl-12 pr-4 bg-slate-50 border-2 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all ${errors.phone
                                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                        : "border-slate-200 focus:bg-white focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10"
                                        }`}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                />
                                {errors.phone && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-red-600 font-semibold mt-1 ml-1"
                                    >
                                        {errors.phone}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                            E-Posta
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004aad] transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="ornek@mail.com"
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border-2 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all ${errors.email
                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                    : "border-slate-200 focus:bg-white focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10"
                                    }`}
                                value={formData.email}
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                            />
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-red-600 font-semibold mt-1 ml-1"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="space-y-2"
                    >
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                            Şifre Oluştur
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004aad] transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full h-12 pl-12 pr-12 bg-slate-50 border-2 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all ${errors.password
                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                    : "border-slate-200 focus:bg-white focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10"
                                    }`}
                                value={formData.password}
                                onChange={(e) => handleFieldChange("password", e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-red-600 font-semibold mt-1 ml-1"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>

                    {/* Terms Checkbox */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-start gap-3 pt-2"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                handleFieldChange("terms", !formData.terms)
                            }
                            className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${formData.terms
                                ? "bg-[#004aad] border-[#004aad]"
                                : "border-slate-300 bg-white hover:border-[#004aad]"
                                }`}
                        >
                            {formData.terms && (
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleFieldChange("terms", !formData.terms)
                            }
                            className="text-xs text-slate-600 leading-relaxed select-none hover:text-slate-900 transition-colors"
                        >
                            <span className="text-slate-900 font-bold hover:underline">
                                Üyelik Sözleşmesi
                            </span>
                            {'nı okudum, onaylıyorum.'}
                        </button>
                    </motion.div>
                    {errors.terms && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-red-600 font-semibold -mt-2 ml-1"
                        >
                            {errors.terms}
                        </motion.p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-gradient-to-r from-[#004aad] to-blue-600 hover:from-[#003d8f] hover:to-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-[#004aad]/30 hover:shadow-xl hover:shadow-[#004aad]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Hesap Oluştur
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="my-8 flex items-center gap-4"
                >
                    <div className="h-[1px] bg-slate-200 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        veya
                    </span>
                    <div className="h-[1px] bg-slate-200 flex-1"></div>
                </motion.div>

                {/* Social Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <button className="h-12 border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#004aad] rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-slate-700 hover:text-[#004aad] text-sm">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            className="w-5 h-5"
                            alt="Google"
                        />
                        Google
                    </button>
                    <button className="h-12 border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#004aad] rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-slate-700 hover:text-[#004aad] text-sm">
                        <img
                            src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                            className="w-5 h-5"
                            alt="Facebook"
                        />
                        Facebook
                    </button>
                </motion.div>

                {/* Login Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-10 text-center pb-6 lg:pb-0"
                >
                    <p className="text-slate-600 font-medium">
                        Zaten hesabın var mı?{" "}
                        <Link
                            href="/user/login"
                            className="text-[#004aad] font-bold hover:underline transition-colors"
                        >
                            Giriş Yap
                        </Link>
                    </p>
                </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-900 to-blue-900 items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src="/images/bg2.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                </motion.div>

            </div>
        </div>
    );
}