"use client";

import Link from "next/link";

export default function EcommerceQuestionsPlaceholder() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="rounded-[var(--bh-card-radius)] bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Müşteri Soruları</h1>
        <p className="text-sm text-slate-600 mt-2">
          abim buralara devam ediyorum entegrasyon yapılacak api
          
        </p>
        <div className="mt-6">
          <Link
            href="/business/ecommerce"
            className="inline-flex px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
          >
            Geri dön
          </Link>
        </div>
      </div>
    </div>
  );
}

