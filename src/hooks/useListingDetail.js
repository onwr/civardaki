"use client";

import { useState, useEffect } from "react";
import { buildListingFromApi } from "@/lib/listing/buildListingFromApi";

export function useListingDetail(slug) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const s = (slug || "").toString().trim();
    if (!s) {
      setLoading(false);
      setNotFound(true);
      setListing(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const resBiz = await fetch(
          `/api/public/businesses/${encodeURIComponent(s)}`,
          { cache: "no-store" },
        );
        if (!resBiz.ok) {
          if (!cancelled) {
            setNotFound(resBiz.status === 404);
            setListing(null);
          }
          return;
        }
        const { business } = await resBiz.json();
        if (cancelled) return;
        const [resCatalog, resReviews] = await Promise.all([
          fetch(`/api/public/businesses/${encodeURIComponent(s)}/catalog`, {
            cache: "no-store",
          }),
          fetch(`/api/public/businesses/${encodeURIComponent(s)}/reviews`, {
            cache: "no-store",
          }),
        ]);
        if (cancelled) return;
        let catalog = { categories: [], uncategorized: [] };
        let reviews = [];
        if (resCatalog.ok) {
          const catData = await resCatalog.json();
          catalog = {
            categories: catData.categories || [],
            uncategorized: catData.uncategorized || [],
          };
        }
        if (resReviews.ok) {
          const revData = await resReviews.json();
          reviews = revData.reviews || [];
        }
        const built = buildListingFromApi(business, catalog, reviews);
        if (!cancelled) setListing(built);
      } catch (_) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { listing, loading, notFound };
}
