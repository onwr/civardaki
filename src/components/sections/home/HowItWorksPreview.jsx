import { ArrowRight, UserPlus, Search, Star } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPreview() {
   const steps = [
      {
         num: "01",
         title: "Hesabını Oluştur",
         desc: "Hızlıca üye ol ve sana en uygun önerileri almak için ilgi alanlarını seç.",
         icon: UserPlus
      },
      {
         num: "02",
         title: "Şehri Keşfet",
         desc: "Konumuna yakın en iyi restoranları, kafeleri ve hizmetleri anında bul.",
         icon: Search
      },
      {
         num: "03",
         title: "Deneyimini Paylaş",
         desc: "Gittiğin yerleri puanla, yorum yap ve topluluğa katkı sağla.",
         icon: Star
      }
   ];

   return (
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2">
                  <span className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full text-sm inline-block mb-6">NASIL ÇALIŞIR?</span>
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                     Civardaki ile Şehri<br />Yeniden Keşfedin
                  </h2>
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                     İhtiyacınız olan her şey parmaklarınızın ucunda. Karmaşık arama süreçlerini unutun, size en yakın ve en güvenilir işletmeleri saniyeler içinde bulun.
                  </p>

                  <div className="space-y-8">
                     {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-5">
                           <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                              {step.num}
                           </div>
                           <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                              <p className="text-gray-500">{step.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-10">
                     <Link href="/how-it-works" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors text-lg group">
                        Daha Fazla Bilgi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </div>

               <div className="lg:w-1/2 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-6 opacity-10"></div>
                  <img
                     src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
                     alt="App Usage"
                     className="relative rounded-[3rem] shadow-2xl z-10 w-full object-cover h-[600px]"
                  />

                  {/* Floating Stat Card */}
                  <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block border border-gray-100">
                     <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                           {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                 <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                              </div>
                           ))}
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">10K+ Yeni Üye</p>
                           <p className="text-xs text-green-500 font-bold">Bu ay katılanlar</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
