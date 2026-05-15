"use client";

import {
  Search,
  Star,
  MessageCircle,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Percent,
  Check,
  Navigation,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    no: "01",
    title: "Hizmeti Bul",
    desc: "Bulunduğun konuma göre en yakın işletmeleri ve hizmetleri saniyeler içinde keşfet.",
    icon: Search,
    image: "/images/how-it-works/step1.png",
  },
  {
    no: "02",
    title: "İşletmeleri Karşılaştır",
    desc: "Yorumları, puanları, hizmetleri ve işletme detaylarını karşılaştırarak doğru seçimi yap.",
    icon: Star,
    image: "/images/how-it-works/step2.png",
  },
  {
    no: "03",
    title: "İletişime Geç",
    desc: "Seçtiğin işletmeyle direkt mesajlaş, arama yap veya hızlıca randevu oluştur.",
    icon: MessageCircle,
    image: "/images/how-it-works/step3.png",
  },
  {
    no: "04",
    title: "Hizmeti Al & Değerlendir",
    desc: "Hizmetini al, deneyimini paylaş ve yorumunla diğer kullanıcılara yardımcı ol.",
    icon: CalendarCheck,
    custom: true,
  },
];

const benefits = [
  {
    title: "Güvenilir İşletmeler",
    desc: "Doğrulanmış ve güvenilir işletmeler.",
    icon: ShieldCheck,
  },
  {
    title: "Gerçek Yorumlar",
    desc: "Gerçek kullanıcı deneyimleri.",
    icon: Star,
  },
  {
    title: "Yakın Konumlar",
    desc: "Konumuna en yakın hizmet sağlayıcılar.",
    icon: MapPin,
  },
  {
    title: "Özel Fırsatlar",
    desc: "Sana özel kampanya ve indirimler.",
    icon: Percent,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f7fbff] to-[#eef6ff] px-4 py-12 md:border border-slate-200 sm:px-6 lg:px-8">
      <div className="absolute left-[-160px] top-20 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute right-[-160px] bottom-10 h-[420px] w-[420px] rounded-full bg-sky-100/70 blur-3xl" />

      <div className="relative mx-auto max-w-[1480px]">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#0057d9] shadow-sm">
            <Navigation className="h-4 w-4" />
            Nasıl Çalışır?
          </span>

          <h2 className="text-[42px] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 md:text-[64px]">
            İhtiyacın olan hizmete{" "}
            <span className="text-[#0057d9]">en hızlı</span> şekilde ulaş.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
            Civardaki ile aradığın hizmeti bulmak, karşılaştırmak ve iletişime
            geçmek çok kolay.
          </p>
        </div>

        <div className="relative grid gap-6 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-[220px] hidden border-t-2 border-dashed border-blue-300 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.no}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative rounded-[34px] border border-slate-100 bg-white p-5 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute left-1/2 top-[-22px] z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#0057d9] text-lg font-black text-white shadow-[0_14px_34px_rgba(0,87,217,0.30)]">
                  {step.no}
                </div>

                <div className="relative mb-3 mt-7">
                  <div className="overflow-hidden rounded-[28px] bg-slate-50">
                    {step.custom ? (
                      <div className="flex h-[350px] flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-50 px-6">
                        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_18px_50px_rgba(16,185,129,0.35)]">
                          <Check className="h-12 w-12 text-white" />
                        </div>

                        <h4 className="text-xl font-black text-slate-950">
                          Randevunuz Oluşturuldu!
                        </h4>

                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                          14 Mayıs Salı · 14:00 <br />
                          Liva Anne · Kadıköy
                        </p>

                      </div>
                    ) : (
                      <img
                        src={step.image}
                        alt={step.title}
                        className="h-[350px] w-full object-cover object-top"
                      />
                    )}
                  </div>

                  <div className="absolute bottom-0 left-1/2 z-30 flex h-16 w-16 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl">
                    <Icon className="h-8 w-8 text-[#0057d9]" />
                  </div>
                </div>

                <div className="px-3 pb-4 pt-12">
                  <h3 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-[15px] leading-7 text-slate-500">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-4 rounded-[32px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:grid-cols-4">
          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index !== benefits.length - 1
                    ? "md:border-r md:border-slate-200"
                    : ""
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                  <Icon className="h-7 w-7 text-[#0057d9]" />
                </div>

                <div>
                  <p className="font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}