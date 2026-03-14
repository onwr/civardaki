"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  SparklesIcon,
  BoltIcon,
  MapPinIcon,
  UserCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  BookmarkSquareIcon,
  FireIcon,
  PencilIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  BellAlertIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Image from "next/image";

export default function CalendarHubPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("daily"); // daily, weekly, monthly

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    occupancy: 0,
    estimatedVolume: 0,
    noShowRisk: "Düşük",
    pendingRequests: 0
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/business/calendar?date=${dateStr}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents(data.events || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Construct ISO dates
    const start = new Date(selectedDate);
    const [h, m] = data.time.split(':');
    start.setHours(parseInt(h), parseInt(m), 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60); // Default 1 hour

    try {
      const res = await fetch("/api/business/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startTime: start.toISOString(),
          endTime: end.toISOString()
        })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success("Etkinlik sisteme işlendi!");
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/calendar?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Etkinlik silindi.");
        fetchEvents();
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calendar Helpers
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();

    const daysArr = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) daysArr.push(null);
    for (let i = 1; i <= days; i++) daysArr.push(new Date(year, month, i));
    return daysArr;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 md:px-8">

      {/* 1. ULTRA-PREMIUM HEADER & LIVE WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-gradient-to-br from-[#004aad] to-blue-800 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl shadow-blue-900/20 group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <CalendarDaysIcon className="w-80 h-80 rotate-12" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200 italic">Live Operations Monitor</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Planlama <br /><span className="text-blue-200">Merkezi</span></h1>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-5 bg-white text-[#004aad] rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
                >
                  <PlusIcon className="w-5 h-5" /> YENİ ETKİNLİK
                </button>
                <button className="p-5 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] hover:bg-white/20 transition-all flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Bugünkü Doluluk</p>
                <p className="text-3xl font-black text-white italic">%{stats.occupancy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Tahmini Hacim</p>
                <p className="text-3xl font-black text-emerald-400">+{stats.estimatedVolume.toLocaleString()}₺</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">No-Show Riski</p>
                <p className="text-3xl font-black text-rose-400 italic">{stats.noShowRisk}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Bekleyen Talep</p>
                <p className="text-3xl font-black text-amber-400">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl overflow-hidden relative group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <SparklesIcon className="w-40 h-40 text-[#004aad]" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <BoltIcon className="w-8 h-8 text-[#004aad]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">AI Scheduling</h3>
            </div>
            <p className="text-sm font-bold text-gray-500 leading-relaxed italic pr-4">
              "Öğle saatlerinde <span className="text-[#004aad] underline underline-offset-4 decoration-blue-200">2 personel azlığı</span> görünüyor. Mevcut randevu yoğunluğuna göre çalışan vardiyalarını optimize etmenizi öneririm."
            </p>
          </div>
          <button className="w-full mt-8 py-5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
            DAHA FAZLA İPUCU <ChevronRightIcon className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 2. THE HUB: CALENDAR & TIMELINE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Left: Interactive Calendar Picker (Bento Style) */}
        <div className="lg:col-span-5 space-y-8 sticky top-32">
          <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-12">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-4 bg-gray-50 hover:bg-blue-50 hover:text-[#004aad] rounded-2xl transition-all">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black uppercase text-gray-950 tracking-tight italic">{monthName}</h2>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-4 bg-gray-50 hover:bg-blue-50 hover:text-[#004aad] rounded-2xl transition-all">
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {daysInMonth.map((day, i) => (
                <div key={i} className="aspect-square flex items-center justify-center">
                  {day ? (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-full h-full rounded-[1.5rem] flex items-center justify-center font-black transition-all relative group/day
                                ${selectedDate.toDateString() === day.toDateString()
                          ? 'bg-gradient-to-br from-[#004aad] to-blue-600 text-white shadow-xl shadow-blue-500/30'
                          : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100'}`}
                    >
                      {day.getDate()}
                      {day.getDate() % 5 === 0 && selectedDate.toDateString() !== day.toDateString() && (
                        <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full group-hover/day:scale-150 transition-transform" />
                      )}
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gray-950 rounded-[3.5rem] p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5" />
            <div className="relative z-10 space-y-8">
              <h4 className="text-xl font-black uppercase tracking-tight text-blue-400">Günün Görevleri</h4>
              <div className="space-y-4">
                {[
                  { icon: BellAlertIcon, text: "Kurye toplantısı", time: "09:00", color: "text-amber-400" },
                  { icon: CheckCircleIcon, text: "Yemek sepeti onayı", time: "11:30", color: "text-emerald-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.text}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Daily High-Fidelity Timeline */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl p-10 md:p-14 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-50 pb-10">
              <div>
                <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic">Günlük <span className="text-[#004aad]">Akış</span></h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">
                  {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                </p>
              </div>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl shrink-0">
                <button className="px-6 py-2.5 bg-white text-[#004aad] rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm">GÜNLÜK</button>
                <button className="px-6 py-2.5 text-gray-400 hover:text-gray-900 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">HAFTALIK</button>
              </div>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[2.75rem] before:top-4 before:bottom-4 before:w-[1px] before:bg-gray-100">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex gap-8 relative z-10"
                >
                  <div className="w-24 shrink-0 text-right pt-4">
                    <p className="text-xl font-black text-gray-950 leading-none">{new Date(event.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 italic">60 dk</p>
                  </div>

                  <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 mt-5 shrink-0" />

                  <div className="flex-1 bg-gray-50 hover:bg-white p-8 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer">
                    <div className={`absolute top-0 right-10 w-32 h-32 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0
                             ${event.category === 'reservation' ? 'text-blue-600' : event.category === 'task' ? 'text-amber-600' : 'text-purple-600'}`}>
                      {event.category === 'reservation' ? <BookmarkSquareIcon /> : event.category === 'task' ? <ClockIcon /> : <UserCircleIcon />}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg italic
                                      ${event.category === 'RESERVATION' ? 'bg-blue-100 text-blue-600' : event.category === 'TASK' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                            {event.category}
                          </span>
                          {event.priority === 'HIGH' && (
                            <div className="flex items-center gap-1 text-rose-500">
                              <FireIcon className="w-4 h-4" />
                              <span className="text-[9px] font-black uppercase">ACİL</span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-xl md:text-2xl font-black text-gray-950 uppercase leading-tight group-hover:text-[#004aad] transition-colors italic">{event.title}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://i.pravatar.cc/100?u=${event.id}')` }} />
                            <span className="text-xs font-bold text-gray-500">{event.customerName}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                          <p className="text-xs font-bold text-gray-400 italic">VIP Onay Bekliyor</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-4 bg-white border border-gray-100 rounded-[1.25rem] hover:bg-white hover:text-[#004aad] hover:shadow-lg transition-all text-gray-400">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="p-4 bg-white border border-gray-100 rounded-[1.25rem] hover:bg-rose-50 hover:text-rose-600 hover:shadow-lg transition-all text-gray-400">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-10 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-400 italic">Müsaitlik Durumu: <span className="text-emerald-600 font-black">Mükemmel</span></p>
              </div>
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">TÜM PROGRAMI YAZDIR</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODERN MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[5rem] p-10 md:p-14 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#004aad]/5 rounded-full blur-3xl -mr-32 -mt-32" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/10">
                      <CalendarIcon className="w-8 h-8 text-[#004aad]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase italic">Yeni Kayıt</h2>
                      <p className="text-gray-400 font-medium italic">Seçili tarih: {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all shadow-sm">
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Başlık / Operasyon Adı</label>
                    <input type="text" name="title" required placeholder="Örn: VIP Masa Rezervasyonu" className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Müşteri / Ekip</label>
                    <input type="text" name="customerName" placeholder="Örn: Ahmet Yılmaz" className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Planlanan Saat</label>
                      <div className="relative">
                        <ClockIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-[#004aad]" />
                        <input type="time" name="time" required className="w-full pl-20 pr-8 py-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Kategori</label>
                      <select name="category" className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic appearance-none">
                        <option value="RESERVATION">Rezervasyon</option>
                        <option value="APPOINTMENT">Randevu</option>
                        <option value="TASK">Görev</option>
                        <option value="SUPPLIER">Tedarik</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-7 bg-gray-100 text-gray-400 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all">VAZGEÇ</button>
                    <button type="submit" className="flex-[2] py-7 bg-gray-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-3xl hover:bg-[#004aad] transition-all">ETKİNLİĞİ ONAYLA</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
