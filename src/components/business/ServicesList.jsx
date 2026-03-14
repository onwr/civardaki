"use client";

import { CheckCircle2 } from "lucide-react";

export default function ServicesList({ services = [], onCTA }) {
    if (!services || services.length === 0) return null;

    // Support both array and parsed JSON array
    const list = Array.isArray(services) ? services : [];

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight italic">
                Sunulan <span className="text-blue-600">Hizmetler</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                {list.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-sm font-black text-slate-700 italic group-hover:text-slate-950 transition-colors uppercase tracking-tight">
                            {service}
                        </span>
                    </div>
                ))}
            </div>

            {onCTA && (
                <button
                    onClick={onCTA}
                    className="mt-6 w-full py-4 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors shadow-lg shadow-black/5"
                >
                    TÜM HİZMETLER İÇİN TEKLİF AL
                </button>
            )}
        </div>
    );
}
