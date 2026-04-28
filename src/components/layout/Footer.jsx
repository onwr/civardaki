"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowRight } from "lucide-react";

export default function Footer() {
   const currentYear = new Date().getFullYear();

   return (
      <footer className="bg-white pt-24 pb-12 border-t border-gray-200">
         <div className="container mx-auto px-6 max-w-7xl">

            {/* TOP */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">

               {/* BRAND */}
               <div className="col-span-2 lg:col-span-1">
                  <div className="mb-10">
                     <Image
                        src="/logo.png"
                        alt="Civardaki"
                        width={140}
                        height={40}
                        className="object-contain bg-[#124a86] rounded-3xl p-2"
                     />
                  </div>

                  <ul className="space-y-4 text-sm">
                     <li><Link href="/how-it-works" className="text-gray-500 hover:text-gray-900 transition">Nasıl Çalışır?</Link></li>
                     <li><Link href="/about" className="text-gray-500 hover:text-gray-900 transition">Hakkımızda</Link></li>
                     <li><Link href="/blog" className="text-gray-500 hover:text-gray-900 transition">Blog</Link></li>
                     <li><Link href="/contact" className="text-gray-500 hover:text-gray-900 transition">İletişim</Link></li>
                     <li><Link href="/career" className="text-gray-500 hover:text-gray-900 transition">Kariyer</Link></li>
                  </ul>
               </div>

               {/* SERVICES */}
               <div>
                  <h4 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                     Hizmetler
                  </h4>
                  <ul className="space-y-4 text-sm">
                     <li><Link href="/categories/temizlik" className="text-gray-600 hover:text-black transition">Ev Temizliği</Link></li>
                     <li><Link href="/categories/nakliyat" className="text-gray-600 hover:text-black transition">Evden Eve Nakliyat</Link></li>
                     <li><Link href="/categories/boya" className="text-gray-600 hover:text-black transition">Boya Badana</Link></li>
                     <li><Link href="/categories/ozel-ders" className="text-gray-600 hover:text-black transition">Özel Ders</Link></li>
                     <li><Link href="/categories" className="text-gray-900 font-medium hover:underline">Tüm Kategoriler</Link></li>
                  </ul>
               </div>

               {/* PRICING */}
               <div>
                  <h4 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                     Fiyatlar
                  </h4>
                  <ul className="space-y-4 text-sm">
                     <li><Link href="/prices/nakliyat" className="text-gray-600 hover:text-black transition">Nakliyat</Link></li>
                     <li><Link href="/prices/temizlik" className="text-gray-600 hover:text-black transition">Temizlik</Link></li>
                     <li><Link href="/prices/boya" className="text-gray-600 hover:text-black transition">Boya Badana</Link></li>
                  </ul>
               </div>

               {/* MOST SEARCHED */}
               <div className="col-span-2 lg:col-span-1">
                  <h4 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                     En Çok Aranan
                  </h4>
                  <ul className="space-y-4 text-sm">
                     <li><Link href="/s/istanbul-temizlik" className="text-gray-600 hover:text-black transition">İstanbul Ev Temizliği</Link></li>
                     <li><Link href="/s/ankara-boyaci" className="text-gray-600 hover:text-black transition">Ankara Boyacı</Link></li>
                     <li><Link href="/s/izmir-nakliyat" className="text-gray-600 hover:text-black transition">İzmir Nakliyat</Link></li>
                  </ul>
               </div>

               {/* CTA */}
               <div className="flex flex-col items-start lg:items-end col-span-2 lg:col-span-1">
                  <Link
                     href="/business/register"
                     className="px-7 py-3 bg-[#0f172a] text-white text-sm font-semibold rounded-lg hover:bg-black transition flex items-center gap-2 group"
                  >
                     İşletme Ekle
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>

            </div>

            {/* BOTTOM */}
            <div className="pt-10 border-t border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-8">

               {/* LEFT */}
               <div className="flex flex-col items-center lg:items-start gap-5">

                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
                     <Link href="/terms" className="hover:text-black transition">Kullanıcı Sözleşmesi</Link>
                     <Link href="/privacy" className="hover:text-black transition">Gizlilik Politikası</Link>
                     <Link href="/cookies" className="hover:text-black transition">Çerez Politikası</Link>
                     <Link href="/kvkk" className="hover:text-black transition">KVKK</Link>
                  </div>

                  <div className="text-xs text-gray-400">
                     © {currentYear} Civardaki.com <span className="text-black" style={{ fontWeight: 'bold' }}>TAMPAZAR ELEKTRONİK TİCARET SANAYİ LİMİTED ŞİRKETİ&nbsp;</span>tüm hakları saklıdır.
                  </div>

               </div>

               {/* SOCIAL */}
               <div className="flex items-center gap-3">
                  {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                     <a
                        key={i}
                        href="#"
                        className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-gray-400 hover:text-black transition border border-gray-200"
                     >
                        <Icon className="w-4 h-4" />
                     </a>
                  ))}
               </div>

            </div>

         </div>
      </footer>
   );
}