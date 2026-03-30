"use client";

import Link from "next/link";

export default function EcommerceSettingsPlaceholder() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="rounded-[var(--bh-card-radius)] bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">E‑Ticaret Ayarları</h1>
        <p className="text-sm text-slate-600 mt-2">
        abim buralara devam ediyorum entegrasyon yapılacak api

        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/business/ecommerce"
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            E‑Ticaret ana sayfa
          </Link>
          <Link
            href="/business/ecommerce/statistics"
            className="px-4 py-2 rounded-lg bg-[#004aad] text-white text-sm font-medium hover:bg-[#003d8f]"
          >
            İstatistikler
          </Link>
        </div>
      </div>
    </div>
  );
}

