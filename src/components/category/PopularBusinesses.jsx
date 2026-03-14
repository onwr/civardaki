import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function PopularBusinesses({ categoryRaw, categoryDisplayName }) {
    if (!categoryRaw) return null;

    try {
        const popular = await prisma.business.findMany({
            where: {
                isActive: true,
                category: categoryRaw
            },
            select: {
                name: true,
                slug: true,
                logoUrl: true,
                city: true,
                district: true,
                ratingSum: true,
                responseCount: true
            },
            orderBy: [
                { ratingSum: 'desc' },
                { responseCount: 'desc' }
            ],
            take: 6
        });

        if (popular.length === 0) return null;

        return (
            <section className="bg-white py-16 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-slate-800">
                            En Popüler {categoryDisplayName}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popular.map(b => (
                            <Link key={b.slug} href={`/business/${b.slug}`} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0">
                                    {b.logoUrl ? (
                                        <Image src={b.logoUrl} alt={b.name} width={64} height={64} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">LOGO</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{b.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">{b.district ? `${b.district}, ` : ''}{b.city || ''}</p>
                                    {b.ratingSum > 0 && b.responseCount > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-amber-500">⭐</span>
                                            <span className="text-[11px] font-black text-slate-700">{(b.ratingSum / b.responseCount).toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        );
    } catch (e) {
        console.error("PopularBusinesses error:", e);
        return null;
    }
}
