"use client";

import { useEffect, useState } from "react";

/**
 * Yerleşime göre public API'den reklamları çekip gösterir.
 * @param {Object} props
 * @param {string} props.placement - Zorunlu. BANNER | SIDEBAR | LISTING_TOP | LISTING_INLINE | FOOTER | POPUP
 * @param {number} [props.limit] - İsteğe bağlı limit (varsayılan API'de 5, max 10)
 */
export default function AdSlot({ placement, limit }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!placement) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ placement });
    if (limit != null) params.set("limit", String(limit));
    fetch(`/api/ads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.ads)) setAds(data.ads);
        else setError(data.error || "Veri alınamadı");
      })
      .catch(() => setError("Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [placement, limit]);

  if (loading) {
    return (
      <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 min-h-[80px] flex items-center justify-center">
        <span className="text-slate-400 text-sm">Reklam yükleniyor...</span>
      </div>
    );
  }

  if (error || !ads.length) {
    return null;
  }

  return (
    <div className="ads-slot" data-placement={placement}>
      {ads.map((ad) => (
        <AdItem key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

function AdItem({ ad }) {
  const { title, description, imageUrl, linkUrl } = ad;
  const content = (
    <>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title || "Reklam"}
          className="w-full h-auto object-cover rounded-lg"
        />
      )}
      <div className="p-3">
        {title && <h3 className="font-semibold text-slate-100">{title}</h3>}
        {description && (
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </>
  );

  const wrapperClass =
    "block rounded-lg bg-slate-800/60 border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors";

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClass}
      >
        {content}
      </a>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
