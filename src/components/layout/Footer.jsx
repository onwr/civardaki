"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
  MapPin,
  Smartphone,
  Send,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socials = [
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-100 bg-white">
      {/* glow */}
      <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute right-[-120px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto container px-3 md:px-0">
        {/* TOP CTA */}
        <div className="relative -mt-10 mb-20 overflow-hidden rounded-[36px] border border-slate-100 bg-gradient-to-br from-[#0057d9] via-[#0b63e6] to-[#1e40af] px-8 py-10 shadow-[0_30px_80px_rgba(0,87,217,0.28)] md:px-12 md:py-12">
          <div className="absolute right-0 top-0 h-full w-[45%] bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur-xl">
                <Smartphone className="h-4 w-4" />
                Civardaki Mobil
              </div>

              <h2 className="text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-white md:text-[52px]">
                Mahallendeki fırsatları
                <br />
                kaçırma.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">
                Civardaki uygulamasını indir, yakınındaki işletmeleri keşfet,
                kampanyaları görüntüle ve hizmetlere saniyeler içinde ulaş.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Link
                href="/download"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-base font-black text-[#0057d9] shadow-xl transition hover:scale-[1.02]"
              >
                Uygulamayı İndir
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/business/register"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 text-base font-black text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                İşletme Ekle
                <Send className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid gap-14 border-b border-slate-100 pb-16 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr]">
          {/* BRAND */}
          <div>
            <div className="mb-8">
              <Image
                src="/logo.png"
                alt="Civardaki"
                width={170}
                height={48}
                className="rounded-2xl bg-[#0057d9] p-2"
              />
            </div>

            <p className="max-w-sm text-[15px] leading-7 text-slate-500">
              Civardaki ile yakınındaki işletmeleri keşfet, kampanyaları
              görüntüle ve ihtiyacın olan hizmete saniyeler içinde ulaş.
            </p>

            <div className="mt-8 flex items-center gap-3">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:bg-blue-50 hover:text-[#0057d9]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Platform
            </h4>

            <ul className="space-y-4 text-[15px]">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Nasıl Çalışır?
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Hakkımızda
                </Link>
              </li>

              <li>
                <Link
                  href="/blog"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Hizmetler
            </h4>

            <ul className="space-y-4 text-[15px]">
              <li>
                <Link
                  href="/categories/temizlik"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Ev Temizliği
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/nakliyat"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Nakliyat
                </Link>
              </li>

              <li>
                <Link
                  href="/categories/oto-servis"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Oto Servis
                </Link>
              </li>

              <li>
                <Link
                  href="/categories"
                  className="font-bold text-slate-900 transition hover:text-[#0057d9]"
                >
                  Tüm Kategoriler
                </Link>
              </li>
            </ul>
          </div>

          {/* POPULAR */}
          <div>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Popüler
            </h4>

            <ul className="space-y-4 text-[15px]">
              <li>
                <Link
                  href="/s/istanbul-temizlik"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  İstanbul Temizlik
                </Link>
              </li>

              <li>
                <Link
                  href="/s/ankara-boyaci"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  Ankara Boyacı
                </Link>
              </li>

              <li>
                <Link
                  href="/s/izmir-nakliyat"
                  className="text-slate-600 transition hover:text-[#0057d9]"
                >
                  İzmir Nakliyat
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="mb-6 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              İletişim
            </h4>

            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <MapPin className="h-7 w-7 text-[#0057d9]" />
              </div>

              <p className="text-sm leading-7 text-slate-600">
                Civardaki ile mahallendeki işletmeleri keşfetmeye hemen başla.
              </p>

              <Link
                href="/business/register"
                className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0057d9]"
              >
                İşletme Oluştur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-5 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
            <Link href="/terms" className="hover:text-[#0057d9]">
              Kullanıcı Sözleşmesi
            </Link>

            <Link href="/privacy" className="hover:text-[#0057d9]">
              Gizlilik Politikası
            </Link>

            <Link href="/cookies" className="hover:text-[#0057d9]">
              Çerez Politikası
            </Link>

            <Link href="/kvkk" className="hover:text-[#0057d9]">
              KVKK
            </Link>
          </div>

          <div className="text-sm text-slate-400">
            © {currentYear} Civardaki.com —{" "}
            <span className="font-bold text-slate-700">
              TAMPAZAR ELEKTRONİK TİCARET SANAYİ LTD. ŞTİ.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}