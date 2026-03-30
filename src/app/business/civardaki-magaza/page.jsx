"use client";

import Link from "next/link";
import { Store, Filter, Search } from "lucide-react";

export default function CivardakiMagazaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      <div className="rounded-[var(--bh-card-radius)] bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Civardaki Mağaza</h1>
            <p className="text-sm text-slate-500">
              Armut tarzı liste ve filtreler bir sonraki sürümde burada olacak.
            </p>
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Ürünlerinizi pazaryerinde göstermek için{" "}
          <Link href="/business/products" className="font-semibold text-[#004aad] hover:underline">
            Ürünler
          </Link>{" "}
          sayfasında her ürün için <strong>Civardaki pazaryerinde listele</strong> seçeneğini
          işaretleyin.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm">
            <Search className="w-4 h-4" />
            Arama (yakında)
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm">
            <Filter className="w-4 h-4" />
            Filtreleme (yakında)
          </span>
        </div>
      </div>
    </div>
  );
}
