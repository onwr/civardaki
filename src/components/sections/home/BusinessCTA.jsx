"use client";

import Link from "next/link";
import {
  Store,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Users,
  Megaphone,
  BadgePercent,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Daha Fazla Müşteri",
    desc: "Bölgenizdeki binlerce kişiye ulaşın.",
    icon: Users,
  },
  {
    title: "Hizmetlerinizi Tanıtın",
    desc: "Fotoğraflarınızı ve hizmetlerinizi sergileyin.",
    icon: Megaphone,
  },
  {
    title: "Fırsatlar Yayınlayın",
    desc: "Kampanya ve indirimlerle öne çıkın.",
    icon: BadgePercent,
  },
  {
    title: "İstatistikleri Takip Edin",
    desc: "Görüntülenme ve tıklama verilerinizi görün.",
    icon: BarChart3,
  },
  {
    title: "Güven Rozeti",
    desc: "Doğrulanmış işletme profiliyle güven kazanın.",
    icon: ShieldCheck,
  },
];

export default function BusinessCTASection() {
  return (
    <section className="bg-white py-10 md:border border-slate-200">
      <div className="relative overflow-hidden  mx-auto container">

        <div className="relative grid items-center gap-10 px-6 py-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-[#0057d9] shadow-sm">
              <Store className="h-5 w-5" />
              İşletmeler İçin
            </div>

            <h2 className="max-w-2xl text-[42px] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 md:text-[60px]">
              İşletmeni{" "}
              <span className="text-[#0057d9]">Civardaki’ye</span> Ekle
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Mahallendeki müşterilere ulaş, ücretsiz profilini oluştur,
              hizmetlerini tanıt ve fırsatlarını yayınla.
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              {["Daha fazla görünürlük", "Yeni müşteriler", "Kolay yönetim"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 text-base font-bold text-slate-600"
                  >
                    <CheckCircle2 className="h-5 w-5 fill-[#0057d9] text-white" />
                    {item}
                  </span>
                )
              )}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/business/register"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#0057d9] px-8 text-base font-black text-white shadow-[0_16px_36px_rgba(0,87,217,0.28)] transition hover:bg-[#004cc2]"
              >
                Ücretsiz Kaydol
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-base font-black text-[#0057d9] transition hover:bg-blue-50"
              >
                <PlayCircle className="h-5 w-5" />
                Nasıl Çalışır?
              </Link>
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
              src="/images/kayitol.png"
              alt="Civardaki işletme profili"
              className="relative z-10 w-full max-w-[620px] object-contain "
            />
          </motion.div>
        </div>

        <div className="relative border-t border-slate-100 bg-white/75 px-6 py-8 backdrop-blur-xl md:px-10 lg:px-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`text-center ${
                    index !== features.length - 1
                      ? "lg:border-r lg:border-slate-200"
                      : ""
                  }`}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-8 w-8 text-[#0057d9]" />
                  </div>

                  <h3 className="font-black text-slate-950">{item.title}</h3>
                  <p className="mx-auto mt-2 max-w-[220px] text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}