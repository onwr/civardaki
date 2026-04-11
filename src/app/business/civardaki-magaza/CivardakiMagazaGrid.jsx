"use client";

import Link from "next/link";

function formatPrice(price, currency) {
  const v = Number(price);
  if (!Number.isFinite(v)) return null;
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "EUR" ? "EUR" : "TRY",
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${v.toFixed(2)} ₺`;
  }
}

export default function CivardakiMagazaGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-40 w-full rounded-xl bg-slate-100" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Bu filtrelerle eşleşen ürün bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => {
        const displayPrice = formatPrice(p.discountPrice ?? p.price, p.priceCurrency);
        const originalPrice =
          p.discountPrice != null && p.price != null ? formatPrice(p.price, p.priceCurrency) : null;
        const inStock = typeof p.stock === "number" ? p.stock > 0 : p.stock == null;
        const businessHref = p.business?.slug ? `/isletme/${p.business.slug}` : null;

        return (
          <div
            key={p.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative">
              <div className="aspect-[4/3] w-full bg-slate-100">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="absolute left-3 top-3 flex gap-2">
                {p.category?.name ? (
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800">
                    {p.category.name}
                  </span>
                ) : null}
                {inStock ? (
                  <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white">
                    Stokta
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-600/90 px-3 py-1 text-xs font-bold text-white">
                    Stok yok
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="text-sm font-black text-slate-900 line-clamp-2">{p.name}</div>
              {p.business?.name ? (
                <div className="mt-1 text-xs font-semibold text-slate-500">{p.business.name}</div>
              ) : null}

              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-base font-black text-slate-900">{displayPrice || "—"}</div>
                {originalPrice ? (
                  <div className="text-xs font-semibold text-slate-400 line-through">{originalPrice}</div>
                ) : null}
              </div>

              {businessHref ? (
                <Link
                  href={businessHref}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  İşletmeye git
                </Link>
              ) : (
                <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
                  Detay yok
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

