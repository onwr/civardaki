"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Eski URL /user/isletmeler/[slug] -> tek detay sayfası /isletme/[slug] yönlendirmesi.
 * İşletme detayı artık sadece /isletme/[slug] üzerinden sunuluyor.
 */
export default function UserIsletmelerSlugRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.business_slug ?? "").toString().trim();

  useEffect(() => {
    if (!slug) {
      router.replace("/user/isletmeler");
      return;
    }
    router.replace(`/isletme/${slug}`);
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Yönlendiriliyor...</p>
    </div>
  );
}
