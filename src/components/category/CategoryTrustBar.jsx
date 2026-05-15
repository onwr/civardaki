import { Percent, Zap, ShieldCheck } from "lucide-react";

const items = [
    {
        icon: Percent,
        title: "En Uygun Fiyatlar",
        desc: "İşletmeler arasında karşılaştırma yaparak en uygun seçeneği bulun.",
    },
    {
        icon: Zap,
        title: "Hızlı ve Kolay",
        desc: "Tek tıkla teklif alın, işletmelerle hızlıca iletişime geçin.",
    },
    {
        icon: ShieldCheck,
        title: "Güvenilir İşletmeler",
        desc: "Doğrulanmış işletmeler ve gerçek kullanıcı yorumları.",
    },
];

export default function CategoryTrustBar() {
    return (
        <section className="mx-auto container px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 p-6 md:grid-cols-3 md:gap-6 md:p-8">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0057d9] shadow-sm">
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
