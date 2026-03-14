"use client";

import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ArrowRight, UserPlus, Building, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HowItWorksPage() {
  const userSteps = [
    {
      icon: UserPlus,
      title: "Hesabını Oluştur",
      desc: "Hızlıca üye ol ve profilini oluştur. İlgi alanlarını belirle, sana özel önerileri yakala.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Search,
      title: "Keşfetmeye Başla",
      desc: "Konumuna en yakın, en popüler veya en yeni işletmeleri kategorilere göre filtrele.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Star,
      title: "Deneyimle ve Paylaş",
      desc: "Hizmet aldığın işletmeleri değerlendir, yorum yap ve favori mekanlarını arkadaşlarınla paylaş.",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const businessSteps = [
    {
      icon: Building,
      title: "İşletmeni Kaydet",
      desc: "İşletme bilgilerini gir, vitrinini oluştur ve logo/fotoğraf yükleyerek profesyonel görün.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: CheckCircle,
      title: "Onay ve Yayın",
      desc: "Ekibimiz başvurunu incelesin. Onaylandıktan sonra işletmen anında binlerce kullanıcıya ulaşsın.",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: MapPin,
      title: "Müşteri Kazan",
      desc: "Rezervasyon al, yorumları yönet, kampanyalar oluştur ve müşteri kitleni büyüt.",
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-16 lg:pt-48 lg:pb-24 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Nasıl Çalışır?</h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto">
               Civardaki, işletmeler ve kullanıcılar için en kolay ve etkili buluşma noktasıdır. Sistemimizin nasıl işlediğini keşfedin.
             </p>
          </motion.div>
        </div>
      </div>

      {/* For Users Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
              <span className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full text-sm">KULLANICILAR İÇİN</span>
              <h2 className="text-3xl font-bold mt-4 text-gray-900">Kolayca Keşfet, Güvenle Seç</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10 border-t-2 border-dashed border-gray-300"></div>

              {userSteps.map((step, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.2 }}
                   viewport={{ once: true }}
                   className="flex flex-col items-center text-center group"
                 >
                    <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                       <step.icon className="w-10 h-10" />
                    </div>
                    <div className="bg-white p-4">
                       <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                       <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                 </motion.div>
              ))}
           </div>
           
           <div className="text-center mt-12">
              <Link href="/register" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors">
                 Hemen Başla <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
              <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full text-sm">İŞLETMELER İÇİN</span>
              <h2 className="text-3xl font-bold mt-4 text-gray-900">İşini Büyütmenin En Akıllı Yolu</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div className="space-y-12">
                 {businessSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                       <div className="flex-shrink-0">
                          <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-md`}>
                             <step.icon className="w-7 h-7" />
                          </div>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600">{step.desc}</p>
                       </div>
                    </div>
                 ))}
                 
                 <div className="pt-4">
                    <Link href="/business/register" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg inline-block">
                       İşletmeni Ekle
                    </Link>
                 </div>
              </div>

              <div className="relative hidden lg:block">
                 <div className="absolute inset-0 bg-emerald-500 rounded-3xl transform rotate-3 opacity-20 blur-xl"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80" 
                   alt="Business Growth" 
                   className="relative rounded-3xl shadow-2xl z-10 w-full"
                 />
                 
                 {/* Floating Card */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-xs"
                 >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <CheckCircle className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Onaylandı</p>
                          <p className="text-xs text-gray-500">İşletme Hesabı</p>
                       </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="w-3/4 h-full bg-green-500"></div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 bg-blue-600 relative overflow-hidden text-center">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
         <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8">Hazır Mısın?</h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">
               İster yeni yerler keşfet, ister potansiyel müşterilerine ulaş. Civardaki dünyası seni bekliyor.
            </p>
            <div className="flex justify-center gap-6">
                <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-colors">
                   Ücretsiz Üye Ol
                </Link>
            </div>
         </div>
      </section>
      
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
         <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6 text-white">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">C</div>
                <span className="font-bold text-xl">Civardaki</span>
            </div>
            <p className="mb-6 text-sm">Tüm hakları saklıdır &copy; 2025</p>
         </div>
      </footer>
    </div>
  );
}
