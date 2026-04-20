"use client";

import { motion } from "framer-motion";
import { Zap, ChevronRight, CheckCircle2, Circle, PartyPopper } from "lucide-react";
import Link from "next/link";
import { getOnboardingMessage } from "@/lib/onboarding";

export default function OnboardingCompletion({ score, pendingTasks }) {
    const message = getOnboardingMessage(score);

    if (score >= 100) return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <PartyPopper className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-emerald-900 leading-none mb-2">Profiliniz Tamamlandı!</h3>
                    <p className="text-emerald-700 font-bold opacity-80 italic">Müşterileriniz artık sizi tüm detaylarınızla görüyor.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 border border-slate-100 p-8 md:p-10 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                                <Zap className="w-3 h-3 fill-current" />
                                Profil İlerlemesi
                            </span>
                            <span className="text-blue-600 font-black italic uppercase tracking-widest text-[10px]">
                                {score}% Tamamlandı
                            </span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase leading-none mb-6">
                            Profilini <span className="text-blue-600">Güçlendir</span>
                        </h3>
                        <p className="text-slate-500 font-bold leading-relaxed max-w-lg mb-8 italic">
                            {message}
                        </p>

                        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden w-full max-w-md">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-around">
                                {[20, 40, 60, 80].map(pt => (
                                    <div key={pt} className="w-1 h-1 rounded-full bg-white/30" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-[24px] bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-slate-200"
                                />
                                <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={251.2}
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className="text-blue-600"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-900 italic">
                                {score}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingTasks.map((task, i) => {
                        const label = task.title ?? task.label ?? "Adımı tamamla";
                        const href = task.linkUrl ?? task.cta ?? "/business/onboarding";
                        const weight = task.weight ?? Math.round(100 / (pendingTasks.length || 1));
                        return (
                            <Link
                                key={task.id ?? i}
                                href={href}
                                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 group/item active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-300 group-hover/item:text-blue-500 transition-colors">
                                        <Circle className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 tracking-tight group-hover/item:text-slate-900">
                                        {label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        +{weight}%
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
