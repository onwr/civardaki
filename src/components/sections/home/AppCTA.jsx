import Image from "next/image";
import Link from "next/link";
import { Apple, Play } from "lucide-react";

export default function AppCTA() {
   return (
      <section className="py-16 overflow-hidden">
         <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center">

               {/* Left Side: Content */}
               <div className="w-full md:w-1/2 flex flex-col justify-center mb-16 md:mb-0 md:pr-12 relative z-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1e293b] leading-tight mb-5 tracking-tight">
                     Hemen indir, <br className="hidden md:block" />
                     işlerini kolaylaştır!
                  </h2>

                  <p className="text-slate-600 text-base md:text-lg mb-10 leading-relaxed max-w-lg">
                     Civardaki uygulamasını ücretsiz indir, konumuna en yakın işletmeleri anında keşfet. İşletmelerle hemen mesajlaş, teklif al ve aradığın hizmete anında ulaş.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                     {/* App Store Button */}
                     <Link href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <Apple className="w-8 h-8" fill="currentColor" />
                        <div className="flex flex-col">
                           <span className="text-[11px] leading-none text-gray-300 mb-1">App Store'dan</span>
                           <span className="text-lg font-semibold leading-none">İndirin</span>
                        </div>
                     </Link>

                     {/* Google Play Button */}
                     <Link href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <Play className="w-7 h-7" fill="currentColor" />
                        <div className="flex flex-col">
                           <span className="text-[11px] leading-none text-gray-300 mb-1">Google Play</span>
                           <span className="text-lg font-semibold leading-none">'DEN ALIN</span>
                        </div>
                     </Link>
                  </div>
               </div>

               {/* Right Side: Image */}
               <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
                  {/* Decorative circle behind phone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white rounded-full opacity-60 blur-3xl -z-10" />

                  <div className="relative w-full max-w-[320px] md:max-w-[450px] aspect-[4/5] md:aspect-square">
                     <Image
                        src="/images/app-cta2.png"
                        alt="Civardaki Mobil Uygulaması"
                        fill
                        className="object-scale-down rounded-xl mix-blend-multiply drop-shadow-2xl md:scale-[1.20]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                     />
                  </div>
               </div>

            </div>
         </div>
      </section>
   );
}
