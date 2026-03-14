"use client";

import Link from "next/link";
import { Utensils, ShoppingBasket, Wrench, Sparkles, Truck, GraduationCap, Home, Scissors, ChevronRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Yemek & İçecek",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
    href: "/search?category=food",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
  },
  {
    id: 2,
    name: "Market",
    icon: ShoppingBasket,
    color: "bg-green-100 text-green-600",
    href: "/search?category=market",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"
  },
  {
    id: 3,
    name: "Usta & Tamirat",
    icon: Wrench,
    color: "bg-blue-100 text-blue-600",
    href: "/search?category=repair",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80"
  },
  {
    id: 4,
    name: "Güzellik & Bakım",
    icon: Scissors,
    color: "bg-pink-100 text-pink-600",
    href: "/search?category=beauty",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&q=80"
  },
  {
    id: 5,
    name: "Temizlik",
    icon: Sparkles,
    color: "bg-cyan-100 text-cyan-600",
    href: "/search?category=cleaning",
    image: "https://img.freepik.com/ucretsiz-fotograf/kadin-beyaz-duvarda-legende-temizlik-urunu-eldiven-ve-bezler-tutuyor_1150-21780.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    id: 6,
    name: "Nakliye",
    icon: Truck,
    color: "bg-yellow-100 text-yellow-600",
    href: "/search?category=transport",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&q=80"
  },
  {
    id: 7,
    name: "Eğitim",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-600",
    href: "/search?category=education",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
  },
  {
    id: 8,
    name: "Emlak",
    icon: Home,
    color: "bg-indigo-100 text-indigo-600",
    href: "/search?category=real-estate",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80"
  }
];

export default function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4">

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Kategoriler</h2>
            <p className="text-gray-500 text-lg">İhtiyacınız olan hizmeti seçin.</p>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-2 font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
            Tümünü Gör <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile Horizontal Scroll / Desktop Grid */}
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-6 md:pb-0 snap-x hide-scrollbar">
          {categories.map((cat) => (
            <Link href={cat.href} key={cat.id} className="min-w-[160px] md:min-w-0 snap-center group relative overflow-hidden rounded-2xl md:rounded-3xl h-24 md:h-64 cursor-pointer flex md:block items-center md:items-end">

              {/* Desktop Background Image & Overlay */}
              <div className="hidden md:block absolute inset-0">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
              </div>

              {/* Mobile Background (Subtle) */}
              <div className={`md:hidden absolute inset-0 ${cat.color} opacity-10`}></div>
              <div className="md:hidden absolute inset-0 border border-gray-100 rounded-2xl"></div>

              {/* Content */}
              <div className="relative p-4 md:p-6 w-full flex md:flex-col items-center md:items-start md:justify-end h-full gap-3 md:gap-0">

                {/* Icon Wrapper */}
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${cat.color} md:backdrop-blur-md md:bg-opacity-90 md:border md:border-white/20 flex items-center justify-center shrink-0 md:mb-3 shadow-sm md:shadow-lg`}>
                  <cat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                <div className="md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 md:text-white mb-0 md:mb-1 group-hover:text-blue-600 md:group-hover:text-blue-200 transition-colors leading-tight">{cat.name}</h3>

                  {/* Desktop 'Review' Link */}
                  <div className="hidden md:block h-0 group-hover:h-6 overflow-hidden transition-all duration-300">
                    <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                      İncele <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Mobile Arrow */}
                <ChevronRight className="md:hidden w-5 h-5 text-gray-300 ml-auto" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <Link href="/categories" className="flex md:hidden items-center justify-center gap-2 font-bold text-gray-700 bg-gray-100 px-5 py-4 rounded-xl mt-8 hover:bg-gray-200 transition-colors">
          Tüm Kategorileri Gör <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
