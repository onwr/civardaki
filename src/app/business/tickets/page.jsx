"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LifeBuoy, Plus, ChevronRight } from "lucide-react";
import { getStatusLabel, getCategoryLabel } from "@/lib/tickets/config";

function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function BusinessTicketsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/business/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) setItems(data.items);
        else setError(data.error || "Yüklenemedi");
      })
      .catch(() => setError("Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Destek Taleplerim</h1>
          <p className="text-slate-500 text-sm mt-1">Platform ile ilgili destek taleplerinizi görüntüleyin ve yanıtlayın.</p>
        </div>
        <Link
          href="/business/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004aad] text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Yeni talep
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Henüz talep yok</h3>
          <p className="text-slate-500 text-sm mt-2">Bir sorunuz varsa yeni talep oluşturun.</p>
          <Link
            href="/business/tickets/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004aad] text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Yeni talep oluştur
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {items.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/business/tickets/${row.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{row.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getCategoryLabel(row.category)} · {getStatusLabel(row.status)} · {row._count?.messages ?? 0} mesaj
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{formatDate(row.updatedAt)}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
