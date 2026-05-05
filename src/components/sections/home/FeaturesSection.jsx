"use client";

import { Compass, MessageSquareHeart, Zap, Gift } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Kolay Keşfet",
    desc: "İhtiyacın olan hizmete hızlıca ulaş.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: MessageSquareHeart,
    title: "Gerçek Yorumlar",
    desc: "Gerçek kullanıcıların deneyimlerini oku.",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    icon: Zap,
    title: "Zaman Kazan",
    desc: "Aradığını bul, zamandan ve bütçenden tasarruf et.",
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    icon: Gift,
    title: "Fırsatları Yakala",
    desc: "Özel kampanya ve indirimleri kaçırma.",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
];

export default function FeaturesBar() {
  return (
    <section className="pb-8 bg-white">
      <div className="container mx-auto px-6">
        <div className="w-full rounded-3xl bg-gradient-to-r from-slate-100 to-slate-200/70 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">

          {features.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                className="flex items-center gap-4 flex-1 relative"
              >
                {/* divider */}
                {i !== 0 && (
                  <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-px bg-slate-300" />
                )}

                {/* icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>

                {/* text */}
                <div>
                  <p className="font-semibold text-slate-900 text-sm md:text-base">
                    {item.title}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}