import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function SimilarBusinesses({ currentBusiness }) {
    if (!currentBusiness?.category || !currentBusiness?.city) return null;

    try {
        const similar = await prisma.business.findMany({
            where: {
                isActive: true,
                id: { not: currentBusiness.id },
                category: currentBusiness.category,
                city: currentBusiness.city
            },
            select: {
                name: true,
                slug: true,
                logoUrl: true,
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

        if (similar.length === 0) return null;

        return (
            <section className="bg-slate-50 py-16 border-t border-slate-200 mt-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-slate-800">
                            Aynı Kategoride Benzer İşletmeler
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similar.map(b => (
                            <Link key={b.slug} href={`/business/${b.slug}`} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                    {b.logoUrl ? (
                                        <Image src={b.logoUrl} alt={b.name} width={64} height={64} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">LOGO</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{b.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">{b.district || b.city || ''}</p>
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
        console.error("SimilarBusinesses error:", e);
        return null;
    }
}
