"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Check,
    CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Validation Functions
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    useEffect(() => {
        setMounted(true);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!validateEmail(formData.identifier)) {
            newErrors.identifier = "Geçerli bir e-posta adresi girin";
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = "Şifre en az 8 karakter olmalı";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSuccessMessage("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.identifier,
                password: formData.password,
            });

            if (res?.error) {
                setErrors({
                    submit:
                        res.error === "CredentialsSignin"
                            ? "E-posta veya şifre yanlış"
                            : res.error,
                });
            } else {
                setSuccessMessage("✅ Giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => {
                    router.push(callbackUrl);
                    router.refresh();
                }, 1500);
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
                        Tekrar Hoşgeldin! 👋
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 font-semibold"
                    >
                        Hesabına giriş yap, şehrin ayrıcalıklarını yakala.
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

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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
                                className={`w-full h-12 pl-12 pr-4 bg-slate-50 border-2 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all ${errors.identifier
                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                    : "border-slate-200 focus:bg-white focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10"
                                    }`}
                                value={formData.identifier}
                                onChange={(e) =>
                                    handleFieldChange("identifier", e.target.value)
                                }
                                autoComplete="email"
                            />
                            {errors.identifier && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-red-600 font-semibold mt-1 ml-1"
                                >
                                    {errors.identifier}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                Şifre
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-bold text-[#004aad] hover:text-[#003d8f] hover:underline transition-colors"
                            >
                                Şifremi Unuttum?
                            </Link>
                        </div>
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
                                onChange={(e) =>
                                    handleFieldChange("password", e.target.value)
                                }
                                autoComplete="current-password"
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

                    {/* Remember Me Checkbox */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                handleFieldChange("rememberMe", !formData.rememberMe)
                            }
                            className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.rememberMe
                                ? "bg-[#004aad] border-[#004aad]"
                                : "border-slate-300 bg-white hover:border-[#004aad]"
                                }`}
                        >
                            {formData.rememberMe && (
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleFieldChange("rememberMe", !formData.rememberMe)
                            }
                            className="text-sm text-slate-600 font-semibold select-none hover:text-slate-900 transition-colors"
                        >
                            Beni Hatırla
                        </button>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
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
                                Giriş Yap
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
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
                    transition={{ delay: 0.55 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <button
                        type="button"
                        className="h-12 border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#004aad] rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-slate-700 hover:text-[#004aad] text-sm"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            className="w-5 h-5"
                            alt="Google"
                        />
                        Google
                    </button>
                    <button
                        type="button"
                        className="h-12 border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#004aad] rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold text-slate-700 hover:text-[#004aad] text-sm"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                            className="w-5 h-5"
                            alt="Facebook"
                        />
                        Facebook
                    </button>
                </motion.div>

                {/* Register Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 text-center pb-6 lg:pb-0"
                >
                    <p className="text-slate-600 font-medium">
                        Hesabın yok mu?{" "}
                        <Link
                            href="/user/register"
                            className="text-[#004aad] font-bold hover:underline transition-colors"
                        >
                            Kayıt Ol
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