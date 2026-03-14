"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("Güvenlik bağlantınız doğrulanıyor...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Doğrulama linki geçersiz veya eksik.");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch("/api/auth/verify-email/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Doğrulama başarısız");

                setStatus("success");
                setMessage("İşletme hesabınız başarıyla doğrulandı!");

                setTimeout(() => {
                    router.push("/business/dashboard");
                }, 3000);
            } catch (error) {
                setStatus("error");
                setMessage(error.message);
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    {status === "loading" && (
                        <>
                            <div className="w-20 h-20 bg-blue-50 text-[#004aad] rounded-[2rem] flex items-center justify-center mb-6 border border-blue-100 animate-pulse">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tight">Doğrulanıyor</h2>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tight">ONAYLANDI</h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest italic">Panele yönlendiriliyorsunuz...</p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
                                <XCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tight">DOĞRULAMA HATASI</h2>
                            <div className="mt-8">
                                <button onClick={() => router.push("/verify-required")} className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-[#004aad] transition-colors">
                                    YENİ LİNK İSTE
                                </button>
                            </div>
                        </>
                    )}

                    <p className={`mt-4 ${status === 'error' ? 'text-rose-500 font-medium' : 'text-slate-500'} max-w-xs text-sm`}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#004aad]" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
