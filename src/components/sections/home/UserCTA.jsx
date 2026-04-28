import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

export default function UserCTA() {
   return (
      <section className="py-12 bg-white">
         <div className="container mx-auto px-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col-reverse md:flex-row min-h-[360px] md:min-h-[420px] shadow-sm">

               {/* Left Side: Content */}
               <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 md:py-0">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight mb-5 tracking-tight">
                     Mahallenin En <br className="hidden md:block" />
                     <span className="text-[#004aad]">İyilerini Keşfet</span>
                  </h2>

                  <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed">
                     Zamanın sevdiklerine kalsın. Aradığın tüm hizmetleri, ustaları ve işletmeleri gerçek müşteri yorumlarıyla saniyeler içinde bul.
                  </p>

                  <div>
                     <Link
                        href="/search"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#004aad] hover:bg-[#003d8f] shadow-lg shadow-[#004aad]/20 hover:shadow-[#004aad]/40 hover:-translate-y-0.5 text-white font-bold rounded-xl transition-all duration-200"
                     >
                        <Search className="w-5 h-5" /> Hemen Keşfet
                     </Link>
                  </div>
               </div>

               {/* Right Side: Image */}
               <div className="relative w-full md:w-1/2 min-h-[280px] md:min-h-full">
                  <Image
                     src="/images/user-cta.png"
                     alt="Mahallenin En İyilerini Keşfet"
                     fill
                     className="object-cover"
                     sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-50/80 hidden md:block" />
               </div>

            </div>
         </div>
      </section>
   );
}
