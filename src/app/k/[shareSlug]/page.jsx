"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicCatalogPage() {
  const params = useParams();
  const shareSlug = params?.shareSlug;
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!shareSlug) return;
    let cancelled = false;
    fetch(`/api/public/catalogs/${encodeURIComponent(shareSlug)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.message || "Yüklenemedi.");
        return j;
      })
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data });
      })
      .catch((e) => {
        if (!cancelled) setState({ loading: false, error: e.message || "Hata", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [shareSlug]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Yükleniyor…
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <p className="text-center text-slate-700">{state.error || "Katalog bulunamadı."}</p>
      </div>
    );
  }

  const { catalog, business, products } = state.data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">{business.name}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{catalog.name}</h1>
          {catalog.description ? (
            <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{catalog.description}</p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {products.length === 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-amber-900 text-sm">
            Bu katalogda gösterilecek ürün yok.
          </p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-lg object-cover bg-slate-100"
                  />
                ) : (
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  {p.brand ? <p className="text-xs text-slate-500 mt-0.5">{p.brand}</p> : null}
                  {p.categoryName ? (
                    <p className="text-xs text-slate-500 mt-0.5">{p.categoryName}</p>
                  ) : null}
                  {p.description ? (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">{p.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {p.unitPrice != null ? (
                      <span className="font-bold text-teal-700">
                        {Number(p.unitPrice).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </span>
                    ) : null}
                    {p.stockQty != null ? (
                      <span className="text-slate-500">Stok: {p.stockQty}</span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
