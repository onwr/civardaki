"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Hizmeti Bul",
    description:
      "İstanbul, Ankara veya bulunduğun konuma göre en yakın ustaları ve hizmetleri saniyeler içinde bul.",
    image: "/images/how-it-works/step1.png",
  },
  {
    num: "02",
    title: "İşletmeleri Karşılaştır",
    description:
      "Yorumları, puanları, fiyatları ve önceki müşteri deneyimlerini karşılaştırarak en doğru seçimi yap.",
    image: "/images/how-it-works/step2.png",
  },
  {
    num: "03",
    title: "İletişime Geç",
    description:
      "Seçtiğin usta veya işletmeyle direkt mesajlaş, arama yap veya hızlıca randevu oluştur.",
    image: "/images/how-it-works/step3.png",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative pt-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
            Nasıl Çalışır?
          </h2>
          <p className="mt-5 text-gray-500 max-w-2xl mx-auto text-lg">
            İhtiyacın olan hizmete Türkiye’de en hızlı şekilde ulaş.
          </p>
        </div>

        <div className="relative mx-auto">
          {/* Horizontal Line connecting steps (Desktop) */}
          <div className="hidden md:block absolute top-[200px] left-[15%] right-[15%] h-[3px] bg-gray-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Image */}
                <div className="relative w-full aspect-square max-w-[420px] mb-12">
                  <div className="absolute inset-0 bg-white rounded-[3rem] shadow-[0_10px_40px_rgb(0,0,0,0.08)] group-hover:shadow-[0_25px_50px_rgb(0,0,0,0.15)] transition-shadow duration-500" />

                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    priority={i === 0}
                    className="object-contain scale-100 group-hover:scale-125 transition-transform duration-700 ease-out mix-blend-multiply"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Number */}
                <div className="w-16 h-16 rounded-full bg-white border-[4px] border-blue-50 shadow-lg flex items-center justify-center mb-6 text-blue-600 font-extrabold text-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 relative z-10">
                  {step.num}
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-[15px] leading-relaxed px-4">
                  {step.description}
                </p>

                {/* prompt (hidden dev reference) */}
                <div className="hidden">{step.prompt}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}