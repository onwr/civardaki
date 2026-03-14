import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/home/Hero";
import FeaturedListings from "@/components/sections/home/FeaturedListings";
import BusinessCTA from "@/components/sections/home/BusinessCTA";
import AdSlot from "@/components/ads/AdSlot";
import { buildWebSite } from "@/lib/jsonld";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Civardaki - Yakınındaki İşletmeleri Keşfet",
  description:
    "Şehir, ilçe ve kategoriye göre yerel işletmeleri bul; işletmelere doğrudan talep bırak.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com",
  },
  openGraph: {
    title: "Civardaki - Yakınındaki İşletmeleri Keşfet",
    description:
      "Şehir, ilçe ve kategoriye göre yerel işletmeleri bul; işletmelere doğrudan talep bırak.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = buildWebSite();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-900 text-white relative">
        <Header />
        <HeroSection />
      </div>

      <div className="container mx-auto px-4 py-4">
        <AdSlot placement="BANNER" />
      </div>

      <FeaturedListings />
      <BusinessCTA />
      <Footer />
    </>
  );
}
