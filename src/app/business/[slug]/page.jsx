import { notFound } from "next/navigation";
import Image from "next/image";
import BusinessDetailClient from "@/components/business/BusinessDetailClient";
import SimilarBusinesses from "@/components/business/SimilarBusinesses";
import { buildLocalBusiness, buildBreadcrumbList } from "@/lib/jsonld";
import { getPublicBusinessBySlug } from "@/lib/business/getPublicBusinessBySlug";
import { getPublicBusinessCatalogBySlug } from "@/lib/business/getPublicBusinessCatalogBySlug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveParams(params) {
  return params != null && typeof params.then === "function" ? await params : params || {};
}

async function resolveSearchParams(searchParams) {
  return searchParams != null && typeof searchParams.then === "function"
    ? await searchParams
    : searchParams || {};
}

export async function generateMetadata({ params, searchParams }) {
  const { slug: rawSlug } = await resolveParams(params);
  const slug = rawSlug?.toString?.()?.trim();
  const data = slug ? await getPublicBusinessBySlug(slug) : null;
  const b = data?.business;
  if (!b) return { title: "İşletme bulunamadı - Civardaki" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";
  const canonicalUrl = `${appUrl}/business/${b.slug}`;

  const sp = await resolveSearchParams(searchParams);
  const hasSearchParams = sp && Object.keys(sp).length > 0;

  const title = `${b.name} - ${b.district ? b.district + ", " : ""}${b.city || ""} | Civardaki`
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
  const description =
    b.description?.slice(0, 150) ||
    `${b.name}, ${b.district && b.city ? b.district + ", " + b.city : "şehrinizde"} hizmet veriyor. Yorumları okuyun ve iletişime geçin.`;

  const ogImage = b.coverUrl || b.logoUrl || `${appUrl}/default-og.jpg`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !hasSearchParams,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Civardaki",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "profile",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BusinessDetailPage({ params }) {
  const { slug: rawSlug } = await resolveParams(params);
  const slug = rawSlug?.toString?.()?.trim();
  if (!slug) notFound();

  const [data, catalogData] = await Promise.all([
    getPublicBusinessBySlug(slug),
    getPublicBusinessCatalogBySlug(slug),
  ]);
  const b = data?.business;
  if (!b) notFound();

  const catalogForClient = catalogData ?? { categories: [], uncategorized: [] };

  const jsonLd = buildLocalBusiness(b, catalogForClient);

  const breadcrumbItems = [
    { name: "Anasayfa", url: "/" },
    ...(b.category ? [{ name: b.category, url: `/kategori/${b.category}` }] : []),
    ...(b.city ? [{ name: b.city }] : []),
    { name: b.name, url: `/business/${b.slug}` },
  ];
  const breadcrumbLd = buildBreadcrumbList(breadcrumbItems);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}

      <div className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shrink-0">
              {b.logoUrl ? (
                <Image
                  src={b.logoUrl}
                  alt={b.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/40">
                  LOGO
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight truncate">{b.name}</h1>
                {b.category && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 text-[10px] font-extrabold uppercase tracking-widest border border-blue-500/20">
                    {b.category}
                  </span>
                )}
              </div>

              <p className="mt-3 text-slate-300 font-semibold max-w-3xl">
                {b.description || "Bu işletme henüz açıklama eklemedi."}
              </p>

              <div className="mt-4 text-xs font-bold text-slate-400">
                {(b.city || "—") + (b.district ? ` / ${b.district}` : "")}
                {b.address ? ` • ${b.address}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BusinessDetailClient business={b} catalogData={catalogForClient} />

      <SimilarBusinesses currentBusiness={b} />
    </div>
  );
}
