import Link from "next/link";
import Image from "next/image";
import { CategoryIconVisual } from "@/lib/category-icon";

function getEmoji(name = "") {
    const n = name.toLowerCase();
    if (n.includes("lokanta")) return "🍲";
    if (n.includes("kebap")) return "🥙";
    if (n.includes("döner")) return "🌯";
    if (n.includes("pide")) return "🥖";
    return "🏪";
}

export default function CategorySubcategories({ subcategories = [] }) {
    if (!subcategories.length) return null;

    return (
        <section className="mx-auto container px-4 sm:px-6 py-8">
            <h2 className="text-lg font-black text-slate-900 mb-4">Alt Kategoriler</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-6">
                {subcategories.map((child) => (
                    <Link
                        key={child.id}
                        href={`/kategori/${child.slug}`}
                        className="group flex min-w-[200px] shrink-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-[#0057d9]/30 hover:shadow-md sm:min-w-0"
                    >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {child.imageUrl ? (
                                <Image
                                    src={child.imageUrl}
                                    alt={child.displayName || child.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-[#0057d9]">
                                    <CategoryIconVisual
                                        icon={child.icon}
                                        emoji={getEmoji(child.name)}
                                        className="h-6 w-6"
                                    />
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900 group-hover:text-[#0057d9]">
                                {child.displayName || child.name}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                                {child.businessCount} işletme
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
