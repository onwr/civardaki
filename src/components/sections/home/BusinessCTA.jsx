import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store } from "lucide-react";

export default function BusinessCTA() {
   return (
      <section className="py-12 bg-white">
         <div className="container mx-auto px-4">
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row min-h-[360px] md:min-h-[460px] shadow-sm relative">

               {/* Left Side: Image */}
               <div className="relative w-full md:w-1/2 min-h-[280px] md:min-h-full">
                  <Image
                     src="/images/business-cta.png"
                     alt="Civardaki İşle  tme Hesabı"
                     fill
                     className="object-top object-cover"
                     sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Subtle Blue Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/50 hidden md:block" />

                  {/* Floating Badge */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#004aad]/10 rounded-full flex items-center justify-center text-[#004aad]">
                        <Store className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-xs text-gray-500 font-medium">Civardaki</div>
                        <div className="text-sm font-bold text-gray-900">İşletme Hesabı</div>
                     </div>
                  </div>
               </div>

               {/* Right Side: Content */}
               <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 md:py-0 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-[#004aad] font-bold text-xs tracking-wider mb-6 w-fit">
                     BÜYÜMEYE BAŞLA
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
                     İşletmeni <br className="hidden md:block" />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-600">Mahalleliye</span> Tanıt
                  </h2>

                  <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                     Profilini oluştur, menünü veya hizmetlerini sergile. Yakınındaki binlerce yeni müşteriye anında ulaş ve işini hemen büyüt.
                  </p>

                  <div>
                     <Link
                        href="/business/register"
                        className="inline-flex items-center gap-2 px-7 py-4 bg-[#004aad] hover:bg-[#003d8f] shadow-lg shadow-[#004aad]/20 hover:shadow-[#004aad]/40 hover:-translate-y-0.5 text-white font-bold rounded-xl transition-all duration-200"
                     >
                        İşletme Hesabı Aç <ArrowRight className="w-5 h-5" />
                     </Link>
                  </div>
               </div>

            </div>
         </div>
      </section>
   );
}
