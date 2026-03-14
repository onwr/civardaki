"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BusinessLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        rememberMe: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = useMemo(
        () => searchParams.get("callbackUrl") || "/business/dashboard",
        [searchParams]
    );

    useEffect(() => setMounted(true), []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.identifier,
                password: formData.password,
            });

            if (res?.error) {
                setErrorMsg(res.error);
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setIsLoading(false);
            setErrorMsg("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B3B8A] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">Yukleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT: FORM (full height, no centered container look) */}
                <div className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    {/* subtle background */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(11,59,138,0.08),transparent_50%),radial-gradient(900px_circle_at_100%_0%,rgba(2,132,199,0.06),transparent_55%)]" />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-[520px]"
                    >
                        {/* top bar */}
                        <div className="mb-10 flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B3B8A] shadow-sm ring-1 ring-[#0B3B8A]/20">
                                    <img
                                        src="/logo.png"
                                        className="h-6 w-auto object-contain brightness-0 invert"
                                        alt="Logo"
                                    />
                                </div>
                                <div className="leading-tight">
                                    <div className="text-sm font-semibold text-slate-900">Civardaki</div>
                                    <div className="text-xs text-slate-500">İşletme Paneli</div>
                                </div>
                            </Link>

                            <Link
                                href="/business/register"
                                className="text-sm font-semibold text-[#0B3B8A] hover:underline"
                            >
                                Hesap oluştur
                            </Link>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            İşletme girişi
                        </h1>
                        <p className="mt-2 text-base leading-7 text-slate-600">
                            Siparişlerinizi yönetin, ürünlerinizi güncelleyin ve performansınızı takip edin.
                        </p>

                        {/* error */}
                        {errorMsg && (
                            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
                                <div className="text-sm">
                                    <div className="font-semibold">Giriş başarısız</div>
                                    <div className="mt-0.5 text-rose-700/90">{errorMsg}</div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="mt-8 space-y-5">
                            {/* email */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    E-posta
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="isletme@civardaki.com"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] font-medium text-slate-900 outline-none transition
                               focus:border-[#0B3B8A]/40 focus:ring-4 focus:ring-[#0B3B8A]/10"
                                        value={formData.identifier}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, identifier: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-slate-700">Şifre</label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-semibold text-[#0B3B8A] hover:underline"
                                    >
                                        Şifremi unuttum
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-[15px] font-medium text-slate-900 outline-none transition
                               focus:border-[#0B3B8A]/40 focus:ring-4 focus:ring-[#0B3B8A]/10"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, password: e.target.value }))
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.rememberMe}
                                            onChange={(e) =>
                                                setFormData((p) => ({ ...p, rememberMe: e.target.checked }))
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-[#0B3B8A] focus:ring-[#0B3B8A]/20"
                                        />
                                        <span className="text-sm font-medium text-slate-600">Beni hatırla</span>
                                    </label>
                                    <span className="text-xs font-medium text-slate-400">Güvenli bağlantı</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3B8A] text-[15px] font-semibold text-white
                           shadow-[0_12px_26px_rgba(11,59,138,0.22)] ring-1 ring-[#0B3B8A]/25 transition
                           hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <>
                                        Panele giriş yap
                                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>

                            <p className="pt-2 text-center text-sm text-slate-600">
                                Hesabın yok mu?{" "}
                                <Link href="/business/register" className="font-semibold text-slate-900 hover:underline">
                                    Vitrinini oluştur
                                </Link>
                            </p>

                            <p className="pt-2 text-center text-xs text-slate-400">
                                Giriş yaparak{" "}
                                <Link href="/terms" className="hover:underline">
                                    Kullanım Şartları
                                </Link>{" "}
                                ve{" "}
                                <Link href="/privacy" className="hover:underline">
                                    Gizlilik Politikası
                                </Link>
                                ’nı kabul etmiş olursun.
                            </p>
                        </form>
                    </motion.div>
                </div>

                {/* RIGHT: FULL HEIGHT IMAGE */}
                <div className="relative hidden min-h-screen lg:block">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src="/images/login-bg.png"
                            alt="Business"
                            className="h-full w-full object-cover"
                        />
                        {/* overlays */}
                        <div className="absolute inset-0 bg-[#08152b]/55" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(11,59,138,0.45),transparent_60%)]" />

                        {/* content */}
                        <div className="absolute inset-0 flex items-center justify-center px-10">
                            <div className="max-w-2xl text-center text-white">
                                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur">
                                    Civardaki Business
                                </div>

                                <h2 className="mt-6 text-4xl lg:text-5xl font-semibold tracking-tight">
                                    İşletmeni büyüt, müşterine daha hızlı ulaş
                                </h2>

                                <p className="mt-4 text-lg text-white/80">
                                    Ürünlerini yönet, siparişleri takip et, raporlarını gör. Hepsi tek panelde.
                                </p>

                                <div className="mt-10 grid grid-cols-2 gap-6">
                                    {[
                                        { t: "Sipariş kontrolü", d: "Günlük akış ve durum takibi." },
                                        { t: "Stok & ürün", d: "Hızlı güncelleme, net liste." },
                                        { t: "Raporlar", d: "Performans metrikleri." },
                                        { t: "Destek", d: "İhtiyaçta hızlı iletişim." },
                                    ].map((x) => (
                                        <div
                                            key={x.t}
                                            className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md text-left"
                                        >
                                            <div className="text-sm font-semibold">{x.t}</div>
                                            <div className="mt-2 text-sm text-white/75">{x.d}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}