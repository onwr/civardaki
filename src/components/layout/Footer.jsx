import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
   return (
      <footer className="bg-gray-50 pt-20 pb-10 font-inter border-t border-gray-200">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               {/* Brand Column */}
               <div>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="w-10 h-10 bg-[#004aad] rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#004aad]/20">C</div>
                     <span className="font-extrabold text-2xl text-gray-900">Civardaki</span>
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-6">
                     Şehrin en iyilerini keşfetmek, yerel işletmeleri desteklemek ve topluluğun bir parçası olmak için doğru yerdesiniz.
                  </p>
                  <div className="flex gap-4">
                     <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#004aad] hover:text-white hover:border-blue-600 transition-all">
                        <Facebook className="w-5 h-5" />
                     </a>
                     <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all">
                        <Instagram className="w-5 h-5" />
                     </a>
                     <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all">
                        <Twitter className="w-5 h-5" />
                     </a>
                     <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all">
                        <Linkedin className="w-5 h-5" />
                     </a>
                  </div>
               </div>

               {/* Quick Links */}
               <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-6">Hızlı Erişim</h4>
                  <ul className="space-y-3">
                     <li><Link href="/about" className="text-gray-500 hover:text-[#004aad] transition-colors">Hakkımızda</Link></li>
                     <li><Link href="/how-it-works" className="text-gray-500 hover:text-[#004aad] transition-colors">Nasıl Çalışır?</Link></li>
                     <li><Link href="/categories" className="text-gray-500 hover:text-[#004aad] transition-colors">Kategoriler</Link></li>
                     <li><Link href="/blog" className="text-gray-500 hover:text-[#004aad] transition-colors">Blog</Link></li>
                     <li><Link href="/contact" className="text-gray-500 hover:text-[#004aad] transition-colors">İletişim</Link></li>
                  </ul>
               </div>

               {/* For Businesses */}
               <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-6">İşletmeler İçin</h4>
                  <ul className="space-y-3">
                     <li><Link href="/business/register" className="text-gray-500 hover:text-[#004aad] transition-colors">İşletme Ekle</Link></li>
                     <li><Link href="/business/login" className="text-gray-500 hover:text-[#004aad] transition-colors">İşletme Girişi</Link></li>
                     <li><Link href="#" className="text-gray-500 hover:text-[#004aad] transition-colors">Reklam Ver</Link></li>
                     <li><Link href="#" className="text-gray-500 hover:text-[#004aad] transition-colors">Başarı Hikayeleri</Link></li>
                     <li><Link href="#" className="text-gray-500 hover:text-[#004aad] transition-colors">Destek Merkezi</Link></li>
                  </ul>
               </div>

               {/* Contact Info */}
               <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-6">İletişim</h4>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3 text-gray-500">
                        <MapPin className="w-5 h-5 text-[#004aad] shrink-0 mt-1" />
                        <span>Levent Mah. Büyükdere Cad. No:123/A Şişli, İstanbul</span>
                     </li>
                     <li className="flex items-center gap-3 text-gray-500">
                        <Phone className="w-5 h-5 text-[#004aad] shrink-0" />
                        <span>+90 (212) 555 00 00</span>
                     </li>
                     <li className="flex items-center gap-3 text-gray-500">
                        <Mail className="w-5 h-5 text-[#004aad] shrink-0" />
                        <span>info@civardaki.com</span>
                     </li>
                  </ul>
                  {/* Popular Cities */}
                  <div>
                     <h4 className="font-bold text-gray-900 text-lg mb-6">Popüler Şehirler</h4>
                     <ul className="space-y-3">
                        <li><Link href="/istanbul/temizlik" className="text-gray-500 hover:text-[#004aad] transition-colors">İstanbul Temizlik</Link></li>
                        <li><Link href="/ankara/kombi" className="text-gray-500 hover:text-[#004aad] transition-colors">Ankara Kombi Servisi</Link></li>
                        <li><Link href="/izmir/tesisatci" className="text-gray-500 hover:text-[#004aad] transition-colors">İzmir Tesisatçı</Link></li>
                        <li><Link href="/bursa/nakliyat" className="text-gray-500 hover:text-[#004aad] transition-colors">Bursa Evden Eve</Link></li>
                        <li><Link href="/antalya/klima" className="text-gray-500 hover:text-[#004aad] transition-colors">Antalya Klima Bakım</Link></li>
                     </ul>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-gray-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
               <p>&copy; 2025 Civardaki. Tüm hakları saklıdır.</p>
               <div className="flex gap-6 mt-4 md:mt-0">
                  <Link href="/privacy" className="hover:text-gray-900">Gizlilik Politikası</Link>
                  <Link href="/terms" className="hover:text-gray-900">Kullanım Koşulları</Link>
                  <Link href="/security" className="hover:text-gray-900">Güvenlik</Link>
               </div>
            </div>
         </div>
      </footer>
   );
}
