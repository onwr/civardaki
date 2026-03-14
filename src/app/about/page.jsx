"use client";

import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import { Users, Target, Shield, Zap, TrendingUp, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stats = [
    { label: "Aktif İşletme", value: "15K+" },
    { label: "Mutlu Kullanıcı", value: "850K+" },
    { label: "Şehir", value: "81" },
    { label: "Yıllık Büyüme", value: "%120" },
  ];

  const values = [
    {
      icon: Target,
      title: "Misyonumuz",
      desc: "Yerel işletmeleri dijital dünyada güçlendirerek, mahalle kültürünü modern teknolojiyle buluşturmak ve sürdürülebilir yerel ekonomiye katkı sağlamak."
    },
    {
      icon: Users,
      title: "Topluluk Odaklılık",
      desc: "Sadece bir platform değil, işletmeler ve müşteriler arasında güvene dayalı bir köprü kurarak güçlü bir topluluk oluşturuyoruz."
    },
    {
      icon: Shield,
      title: "Güven ve Şeffaflık",
      desc: "Tüm süreçlerimizde şeffaflığı esas alıyor, kullanıcılarımızın verilerini ve deneyimlerini en üst düzeyde koruyoruz."
    },
    {
      icon: Zap,
      title: "Yenilikçilik",
      desc: "Sürekli gelişen teknolojiyi takip ediyor, kullanıcı deneyimini iyileştirmek için yaratıcı çözümler üretiyoruz."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <Header />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/90 to-primary-900"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
          >
            Yerel Güç, <span className="text-blue-400">Küresel Vizyon</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Civardaki, şehrin ritmini tutan, esnafı ve müşteriyi en samimi şekilde bir araya getiren yeni nesil bir keşif platformudur.
          </motion.p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <div className="relative">
                  <div className="absolute -inset-4 bg-blue-100 rounded-3xl transform -rotate-3"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80" 
                    alt="Team Meeting" 
                    className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
                  />
                  <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block">
                     <p className="text-4xl font-bold text-blue-600 mb-1">5+</p>
                     <p className="text-gray-600 text-sm font-medium">Yıllık Tecrübe</p>
                  </div>
               </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Her Şey Bir Mahalle <br/>Hikayesiyle Başladı
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  2020 yılında, dijitalleşen dünyada yerel esnafın sesini daha gür duyurabilmek amacıyla yola çıktık. Amacımız sadece bir rehber olmak değil, işletmelerin dijital dönüşümüne öncülük etmekti.
                </p>
                <p>
                  Bugün, Türkiye'nin 81 ilinde binlerce işletmeyi milyonlarca potansiyel müşteriyle buluşturmanın gururunu yaşıyoruz. Teknolojinin gücünü samimiyetle harmanlayarak, herkesin kazandığı bir ekosistem inşa ediyoruz.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mt-10">
                 <div className="border-l-4 border-blue-500 pl-4">
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-bold text-gray-900">Sürekli Gelişim</h4>
                    <p className="text-sm text-gray-500 mt-1">Her gün daha iyiye</p>
                 </div>
                 <div className="border-l-4 border-rose-500 pl-4">
                    <Heart className="w-8 h-8 text-rose-500 mb-2" />
                    <h4 className="font-bold text-gray-900">Tutkuyla Hizmet</h4>
                    <p className="text-sm text-gray-500 mt-1">%100 Müşteri Memnuniyeti</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                     <div className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2">{stat.value}</div>
                     <div className="text-gray-500 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Değerlerimiz</h2>
             <p className="text-gray-500 text-lg">
               Bizi biz yapan ve her kararımızda bize yol gösteren temel prensiplerimiz.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <val.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
         <div className="container mx-auto px-4">
            <div className="bg-blue-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
               </div>
               
               <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Siz de Bu Hikayenin Parçası Olun</h2>
                  <p className="text-blue-100 text-lg mb-8">
                     İster işletmenizi büyütmek isteyin, ister şehrin en iyilerini keşfetmek. Civardaki ailesi sizi bekliyor.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Link href="/business/register" className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                        İşletme Hesabı Açın
                     </Link>
                     <Link href="/register" className="px-8 py-4 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors border border-blue-700">
                        Kullanıcı Olarak Katılın
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer (Simplified Version) */}
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
