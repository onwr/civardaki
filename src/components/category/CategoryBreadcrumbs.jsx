import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CategoryBreadcrumbs({ parent, currentName }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="mx-auto container px-4 mt-10 sm:px-6 py-4"
        >
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
                <li>
                    <Link href="/" className="hover:text-[#0057d9] transition-colors">
                        Ana Sayfa
                    </Link>
                </li>
                <li aria-hidden className="text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                </li>
                {parent ? (
                    <>
                        <li>
                            <Link
                                href={`/kategori/${parent.slug}`}
                                className="hover:text-[#0057d9] transition-colors"
                            >
                                {parent.name}
                            </Link>
                        </li>
                        <li aria-hidden className="text-slate-300">
                            <ChevronRight className="h-4 w-4" />
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                href="/#kategoriler"
                                className="hover:text-[#0057d9] transition-colors"
                            >
                                Kategoriler
                            </Link>
                        </li>
                        <li aria-hidden className="text-slate-300">
                            <ChevronRight className="h-4 w-4" />
                        </li>
                    </>
                )}
                <li className="text-slate-900 font-black">{currentName}</li>
            </ol>
        </nav>
    );
}
