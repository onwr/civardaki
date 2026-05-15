"use client";

import Link from "next/link";
import {
  Smartphone,
  MapPin,
  Bell,
  Heart,
  ShieldCheck,
  Apple,
  Play,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { title: "Yakındaki İşletmeleri Bul", icon: MapPin },
  { title: "Fırsatları Kaçırma", icon: Tag },
  { title: "Favorilerini Kaydet", icon: Heart },
  { title: "Anlık Bildirimler", icon: Bell },
];

export default function MobileAppSection() {
  return (
    <section className="bg-white py-10 md:border border-slate-200">
      <div className="relative overflow-hidden mx-auto container">
        <div className="relative grid items-center gap-10 px-6 py-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-[#0057d9] shadow-sm">
              <Smartphone className="h-5 w-5" />
              Mobil Deneyim
            </div>

            <h2 className="max-w-2xl text-[42px] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 md:text-[60px]">
              Uygulamayı İndir,{" "}
              <span className="text-[#0057d9]">
                Mahalleni
                <br />
                Keşfet!
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Civardaki uygulaması ile çevrendeki işletmeleri keşfet,
              kampanyaları kaçırma ve favori yerlerini kolayca kaydet.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-xl">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Icon className="h-6 w-6 text-[#0057d9]" strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-black leading-6 text-slate-800">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="#"
                className="flex h-16 items-center justify-center gap-4 rounded-2xl bg-black px-7 text-white shadow-lg transition hover:scale-[1.02]"
              >
                <Apple className="h-8 w-8 fill-white text-white" />
                <div>
                  <p className="text-left text-[11px] font-medium text-white/70">
                    App Store’dan
                  </p>
                  <p className="text-lg font-black">İndir</p>
                </div>
              </Link>

              <Link
                href="#"
                className="flex h-16 items-center justify-center gap-4 rounded-2xl bg-black px-7 text-white shadow-lg transition hover:scale-[1.02]"
              >
                <Play className="h-8 w-8 fill-white text-white" />
                <div>
                  <p className="text-left text-[11px] font-medium text-white/70">
                    Google Play’den
                  </p>
                  <p className="text-lg font-black">İndir</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck className="h-5 w-5 text-[#0057d9]" />
              Ücretsiz indir • Güvenli kullanım
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex justify-center lg:justify-end"
          >
            <img
              src="/images/mobil.png"
              alt="Civardaki mobil uygulama"
              className="relative z-10 w-full max-w-[620px] object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}