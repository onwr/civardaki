"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  UserGroupIcon,
  SparklesIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  UsersIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { mockEmployees } from "@/lib/mock-data/cash";

export default function EmployeesPage() {
  const [employees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const activeEmployees = employees.filter((e) => e.status === "ACTIVE").length;

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM EMPLOYEES HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <UsersIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Çalışanlar</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">HR & Payroll Management Hub</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> PERFORMANS AI
            </button>
            <button className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <PlusIcon className="w-5 h-5" /> YENİ ÇALIŞAN EKLE
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <UsersIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Personel</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {employees.length}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CurrencyDollarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aylık Toplam Maaş</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalSalary.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CheckBadgeIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aktif Çalışan</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{activeEmployees}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="İsim, e-posta veya pozisyon ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. EMPLOYEES LIST */}
      <div className="space-y-6 mx-2 md:mx-4">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map((employee) => (
            <motion.div
              key={employee.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-8 group"
            >
              <div className="flex items-center gap-6 lg:w-[35%] shrink-0">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform bg-blue-50 text-[#004aad]`}>
                  <UserGroupIcon className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-100 text-blue-700`}>
                      {employee.department}
                    </span>
                    {employee.status === 'ACTIVE' ? (
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight bg-emerald-50 px-2 py-0.5 rounded-md">AKTİF</span>
                    ) : (
                      <span className="text-[9px] font-bold text-rose-600 uppercase tracking-tight bg-rose-50 px-2 py-0.5 rounded-md">PASİF</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-gray-950 truncate group-hover:text-[#004aad] transition-colors leading-none uppercase">{employee.name}</h3>
                  <div className="flex items-center gap-2 mt-2.5">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 lowercase tracking-tight">{employee.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pozisyon</p>
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-[#004aad]" />
                      <p className="text-xl font-black text-gray-950 leading-none">{employee.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">İşe Başlama</p>
                    <p className="text-sm font-bold text-gray-900 border-b-2 border-blue-50 inline-block uppercase tracking-tighter">01 KASIM 2023</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 lg:w-[25%] justify-end shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#004aad] uppercase tracking-widest mb-1.5">Net Maaş</p>
                  <p className="text-3xl font-black text-gray-950 tracking-tighter leading-none">
                    {employee.salary.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-emerald-600 transition-all border border-gray-100 shadow-sm">
                    <PencilIcon className="w-6 h-6" />
                  </button>
                  <button className="p-5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all border border-gray-100 shadow-sm">
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

