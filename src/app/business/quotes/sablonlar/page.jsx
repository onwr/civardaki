"use client";

import Link from "next/link";
import { DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function QuoteSablonlarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link
        href="/business/quotes"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Teklifler listesine dön
      </Link>
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <DocumentTextIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Özel Şablonlar</h1>
          <p className="mt-2 text-sm text-slate-500">
            Şablonları oluşturmak, kopyalamak ve düzenlemek için Ayarlar bölümündeki{" "}
            <strong className="text-slate-700">Teklif ve Özel Şablonlar</strong> sayfasını kullanın.
          </p>
          <Link
            href="/business/settings/proposal-templates"
            className="mt-6 inline-flex items-center rounded-xl bg-[#004aad] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-800"
          >
            Şablonlara git
          </Link>
        </div>
      </div>
    </div>
  );
}
