import { Compass, MessageSquareHeart, Zap, Gift } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "İşletmeleri Keşfet",
    description: "Yakınınızdaki en iyi kafe, restoran, usta ve mağazaları tek tıkla bulun, harita üzerinden anında yol tarifi alın.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: MessageSquareHeart,
    title: "Gerçek Yorumlar",
    description: "Daha önce hizmet almış mahallelilerin şeffaf değerlendirmelerini okuyun, en doğru ve güvenilir kararı verin.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: Zap,
    title: "Zaman ve Para Kazan",
    description: "Aradığınız ürün veya hizmet için dükkan dükkan gezmeyin. İşletmelerin fiyat listelerini inceleyip hemen iletişime geçin.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Gift,
    title: "Fırsatları Yakala",
    description: "Civardaki işletmelerin sunduğu güncel kampanyalardan ilk siz haberdar olun, size özel indirimlerden faydalanın.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex flex-col items-start group">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${feature.bgColor}`}
                >
                  <Icon className={`w-7 h-7 ${feature.color}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
