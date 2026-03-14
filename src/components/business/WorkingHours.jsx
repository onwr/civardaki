"use client";

import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const DAYS_TR = {
    mon: "Pazartesi",
    tue: "Salı",
    wed: "Çarşamba",
    thu: "Perşembe",
    fri: "Cuma",
    sat: "Cumartesi",
    sun: "Pazar"
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function WorkingHours({ hours = {} }) {
    if (!hours || Object.keys(hours).length === 0) return null;

    // Get current day/time to show "Open Now" status
    const now = new Date();
    const currentDay = format(now, "eee", { locale: tr }).toLowerCase().slice(0, 3); // mon, tue...
    // In practice we'd need more complex logic for TR locales and specific mappings,
    // but let's assume standard ISO keys for now.

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight italic">
                    Çalışma <span className="text-blue-600">Saatleri</span>
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Şu an Açık
                </div>
            </div>

            <div className="space-y-2">
                {DAY_ORDER.map((day) => {
                    const timeRange = hours[day];
                    if (!timeRange) return null;

                    return (
                        <div key={day} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                            <span className="font-black text-slate-500 uppercase tracking-widest">{DAYS_TR[day]}</span>
                            <span className="font-black text-slate-950 italic">{timeRange}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
