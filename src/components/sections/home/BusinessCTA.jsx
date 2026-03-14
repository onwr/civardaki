import Link from "next/link";
import { Building2, ArrowRight, BarChart3, Users, Globe, TrendingUp, DollarSign, PieChart, Activity, ShieldCheck, Zap } from "lucide-react";

export default function BusinessCTA() {
   return (
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-[#004aad]/5 via-white to-gray-50">

         {/* Background Decor Elements */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#004aad]/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#004aad 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
         </div>

         <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

               {/* Text Content */}
               <div className="lg:max-w-2xl text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#004aad]/20 shadow-sm text-[#004aad] font-bold text-xs uppercase tracking-wider mb-8">
                     <Building2 className="w-4 h-4" />
                     <span>Kurumsal Çözümler</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                     İşletmenizi <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-600">Dijital Dünyaya</span> Taşıyın
                  </h2>

                  <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                     Civardaki Business paneli ile müşteri analizlerine ulaşın, kampanyalarınızı yönetin ve işletmenizin görünürlüğünü <span className="font-bold text-gray-900">%300'e kadar artırın.</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                     <Link href="/business/register" className="px-8 py-4 bg-[#004aad] text-white font-bold rounded-xl hover:bg-[#003d8f] transition-all shadow-lg shadow-[#004aad]/20 hover:shadow-[#004aad]/30 hover:-translate-y-1 flex items-center justify-center gap-2 group">
                        Ücretsiz Başlayın <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </Link>
                     <Link href="/business/demo" className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-1 shadow-sm">
                        Demo Talep Et
                     </Link>
                  </div>

                  <div className="mt-12 flex flex-wrap items-center gap-8 justify-center lg:justify-start">
                     <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                           <CheckCircleIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Kurulum Ücreti Yok</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#004aad]">
                           <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Güvenli Altyapı</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                           <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Hızlı & Kolay</span>
                     </div>
                  </div>
               </div>

               {/* Visual Content (Mock Dashboard) */}
               <div className="relative w-full max-w-lg lg:max-w-xl perspective-1000">

                  {/* Main Card */}
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-10 transform transition-transform duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                     {/* Fake Browser UI */}
                     <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-400"></div>
                           <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                           <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="bg-gray-50 px-4 py-1.5 rounded-md text-[10px] font-medium text-gray-400 flex items-center gap-2 w-48">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           civardaki.com/business
                        </div>
                        <div className="w-4"></div>
                     </div>

                     {/* Dashboard Content */}
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 transition-colors hover:bg-blue-100/50 group/item">
                           <div className="flex items-center justify-between mb-3">
                              <div className="bg-white p-2 rounded-lg shadow-sm text-[#004aad]">
                                 <Users className="w-5 h-5" />
                              </div>
                              <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">+18%</span>
                           </div>
                           <div className="text-2xl font-extrabold text-gray-900 mb-1">12.4K</div>
                           <div className="text-xs text-gray-500 font-medium">Aktif Ziyaretçi</div>
                        </div>

                        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 transition-colors hover:bg-indigo-100/50 group/item">
                           <div className="flex items-center justify-between mb-3">
                              <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                                 <DollarSign className="w-5 h-5" />
                              </div>
                              <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">+24%</span>
                           </div>
                           <div className="text-2xl font-extrabold text-gray-900 mb-1">₺85.2K</div>
                           <div className="text-xs text-gray-500 font-medium">Aylık Ciro</div>
                        </div>
                     </div>

                     {/* Chart Mock */}
                     <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 h-40 relative flex items-end justify-between px-2 gap-2">
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                           <div className="bg-gray-200 p-1.5 rounded-md">
                              <Activity className="w-4 h-4 text-gray-500" />
                           </div>
                           <span className="font-bold text-gray-700 text-sm">Satış Analizi</span>
                        </div>

                        {[30, 45, 35, 55, 45, 70, 60, 85].map((h, i) => (
                           <div key={i} className="w-full bg-[#004aad] rounded-t-lg transition-all duration-500 hover:bg-[#003d8f] relative group/bar" style={{ height: `${h}%`, opacity: 0.2 + (i * 0.1) }}>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                 {h * 15} Ziyaret
                                 <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-12 -right-12 bg-white rounded-2xl shadow-xl p-4 hidden md:flex items-center gap-4 animate-bounce-slow z-20 border border-gray-100 max-w-[240px]">
                     <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                        <DollarSign className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-sm">Yeni Sipariş!</p>
                        <p className="text-xs text-gray-500">Az önce Maslak Şubesi'ne düştü.</p>
                     </div>
                  </div>

                  <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 hidden md:flex items-center gap-4 animate-pulse-slow z-20 border border-gray-100 max-w-[200px]">
                     <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#004aad] shadow-sm">
                        <Users className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-sm">150+ Kişi</p>
                        <p className="text-xs text-gray-500">Şu an inceliyor</p>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </section>
   );
}

// Helper Icon for CheckCircle
function CheckCircleIcon({ className }) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
}
