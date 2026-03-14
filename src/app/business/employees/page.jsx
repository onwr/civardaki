"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BuildingOffice2Icon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  BanknotesIcon,
  XMarkIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Image from "next/image";

const LEAVE_TYPES = [
  { value: "annual", label: "Yıllık İzin" },
  { value: "sick", label: "Hastalık İzni" },
  { value: "unpaid", label: "Ücretsiz İzin" },
  { value: "maternity", label: "Doğum İzni" },
  { value: "paternity", label: "Babalık İzni" },
  { value: "other", label: "Diğer" },
];

function statusLabel(status) {
  if (status === "ACTIVE") return "AKTİF";
  if (status === "ON_LEAVE") return "İZİNLİ";
  if (status === "REMOTE") return "UZAKTAN";
  return "AYRILDI";
}

function statusClass(status) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (status === "ON_LEAVE") return "bg-rose-50 text-rose-500 border-rose-100";
  if (status === "REMOTE") return "bg-blue-50 text-blue-600 border-blue-100";
  return "bg-gray-50 text-gray-400 border-gray-100";
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalSalary: 0,
    avgPerformance: 0,
    onLeave: 0,
  });
  const [departmentDraft, setDepartmentDraft] = useState("");
  const [departmentEdit, setDepartmentEdit] = useState({ id: "", name: "" });
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    salary: "",
    departmentId: "",
  });
  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [empRes, depRes] = await Promise.all([
        fetch("/api/business/employees", { cache: "no-store" }),
        fetch("/api/business/departments", { cache: "no-store" }),
      ]);
      const empData = await empRes.json().catch(() => ({}));
      const depData = await depRes.json().catch(() => ({}));
      if (!empRes.ok) throw new Error(empData.error || "Çalışanlar alınamadı.");
      if (!depRes.ok) throw new Error(depData.error || "Departmanlar alınamadı.");

      setEmployees(Array.isArray(empData.employees) ? empData.employees : []);
      setStats(empData.stats || { total: 0, totalSalary: 0, avgPerformance: 0, onLeave: 0 });
      setDepartments(Array.isArray(depData.departments) ? depData.departments : []);

      setEmployeeForm((prev) => ({
        ...prev,
        departmentId: prev.departmentId || depData.departments?.[0]?.id || "",
      }));
    } catch (error) {
      toast.error(error.message || "Veriler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.departmentId) {
      toast.error("Önce departman oluşturup seçmelisiniz.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Çalışan kaydedilemedi.");

      toast.success("Yeni çalışan başarıyla kaydedildi.");
      setIsEmployeeModalOpen(false);
      setEmployeeForm({
        name: "",
        position: "",
        email: "",
        phone: "",
        salary: "",
        departmentId: departments[0]?.id || "",
      });
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu çalışanı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/employees?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Çalışan silinemedi.");
      toast.success("Çalışan kaydı silindi.");
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "Hata oluştu.");
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    if (!departmentDraft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/business/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: departmentDraft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Departman oluşturulamadı.");
      toast.success("Departman eklendi.");
      setDepartmentDraft("");
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "Departman eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const renameDepartment = async () => {
    if (!departmentEdit.id || !departmentEdit.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/departments/${departmentEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: departmentEdit.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Departman güncellenemedi.");
      toast.success("Departman güncellendi.");
      setDepartmentEdit({ id: "", name: "" });
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "Departman güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!confirm("Departmanı kaldırmak istediğinize emin misiniz?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/departments/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Departman silinemedi.");
      toast.success("Departman kaldırıldı.");
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "Departman silinemedi.");
    } finally {
      setSaving(false);
    }
  };

  const createLeaveRequest = async (e) => {
    e.preventDefault();
    if (!leaveForm.employeeId) {
      toast.error("İzin için çalışan seçmelisiniz.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "İzin talebi oluşturulamadı.");
      toast.success("İzin talebi oluşturuldu.");
      setIsLeaveModalOpen(false);
      setLeaveForm({
        employeeId: "",
        leaveType: "annual",
        startDate: "",
        endDate: "",
        reason: "",
        notes: "",
      });
      await fetchInitialData();
    } catch (error) {
      toast.error(error.message || "İzin talebi oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        String(e.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(e.position || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDepartment === "all" || e.department === filterDepartment;
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, filterDepartment, employees]);

  const departmentFilterOptions = useMemo(() => {
    return ["all", ...new Set(employees.map((e) => e.department).filter(Boolean))];
  }, [employees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4">

      {/* 1. MASTER HR BENTO HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-gray-950 rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform blur-sm">
            <UserGroupIcon className="w-96 h-96" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#004aad] to-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl">
                <BriefcaseIcon className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Ekip Yönetimi</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Elite Human Resources Matrix</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kadro Büyüklüğü</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{stats.total}</span>
                  <span className="text-xs font-bold text-gray-500 mb-1.5">Kişi</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aylık Hakediş</p>
                <p className="text-3xl font-black text-emerald-400">{(stats.totalSalary / 1000).toFixed(1)}k₺</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Genel Performans</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black">%{stats.avgPerformance}</span>
                  <BoltIcon className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aktif İzinli</p>
                <p className="text-3xl font-black text-rose-500">{stats.onLeave}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white rounded-[4rem] p-10 border border-gray-100 shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hızlı Aksiyonlar</p>
              <SparklesIcon className="w-5 h-5 text-[#004aad]" />
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="w-full py-5 bg-[#004aad] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
              >
                <PlusIcon className="w-5 h-5" /> YENİ ÇALIŞAN EKLE
              </button>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
              >
                <CalendarDaysIcon className="w-5 h-5" /> İZİN TALEBİ OLUŞTUR
              </button>
              <button
                onClick={() => setIsDepartmentModalOpen(true)}
                className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
              >
                <BuildingOffice2Icon className="w-5 h-5" /> DEPARTMAN YÖNETİMİ
              </button>
            </div>
          </div>
          <div className="mt-8 p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center gap-5">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-700 uppercase">Departman Kontrolü</p>
              <p className="text-xs font-bold text-amber-900 leading-tight">
                {departments.length
                  ? `${departments.length} aktif departman var.`
                  : "Departman yok. Çalışan eklemek için önce departman oluşturun."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. ADVANCED FILTERS */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-wrap gap-6 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative group">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="İsim, pozisyon veya departman ile hızlı filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-[2.5rem] border-none outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1.5 bg-gray-100 rounded-3xl">
            {departmentFilterOptions.slice(0, 5).map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDepartment(dept)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterDepartment === dept ? "bg-white text-[#004aad] shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
              >
                {dept === "all" ? "HEPSİ" : dept}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!departments.length ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl px-6 py-4 flex items-center justify-between">
          <p className="font-semibold text-sm">Çalışan ekleyebilmek için önce en az bir departman oluşturmalısınız.</p>
          <button
            type="button"
            onClick={() => setIsDepartmentModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 transition text-xs font-black uppercase tracking-wider"
          >
            Departman Oluştur
          </button>
        </div>
      ) : null}

      {/* 3. EMPLOYEES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full rounded-[3rem] bg-white border border-gray-100 p-10 text-center text-gray-500 font-semibold">
              Çalışan kaydı bulunamadı.
            </div>
          ) : null}
          {filteredEmployees.map((emp) => (
            <motion.div
              key={emp.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[4.5rem] p-10 border border-gray-100 shadow-2xl hover:shadow-blue-900/10 transition-all flex flex-col gap-8 relative group overflow-hidden"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#004aad]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#004aad]/10 transition-colors" />

              {/* Status Badge */}
              <div className="absolute top-8 right-8">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${statusClass(emp.status)}`}>
                  {statusLabel(emp.status)}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                  <Image src={emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`} alt={emp.name} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-[#004aad] transition-colors leading-tight">{emp.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{emp.position}</p>
                  <p className="text-xs font-bold text-gray-500 pt-2">{emp.department || "Departman Yok"}</p>
                </div>
              </div>

              {/* Performance Radial Mini */}
              <div className="bg-gray-50/80 rounded-[3rem] p-8 flex items-center justify-between border border-gray-100">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Performans Skoru</p>
                    <p className="text-2xl font-black text-gray-900">%{emp.performance}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4 text-[#004aad]" />
                      <span className="text-[10px] font-black text-gray-500 uppercase">{emp.leaves} Kullanılan İzin</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        {emp.pendingLeaveCount || 0} Bekleyen
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - emp.performance / 100)}
                      className="text-[#004aad]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BoltIcon className="w-6 h-6 text-[#004aad]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-blue-50 group-hover/item:text-[#004aad] transition-all">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 truncate">{emp.email}</p>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 transition-all text-xs">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-gray-900 uppercase">{emp.phone}</p>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-amber-50 group-hover/item:text-amber-600 transition-all">
                    <BanknotesIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-black text-gray-900 italic">{emp.salary.toLocaleString()}₺ <span className="text-[9px] text-gray-400 uppercase not-italic">/ AY</span></p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex gap-4 mt-auto">
                <button
                  onClick={() => {
                    setLeaveForm((prev) => ({ ...prev, employeeId: emp.id }));
                    setIsLeaveModalOpen(true);
                  }}
                  className="flex-1 py-5 bg-gray-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] transition-all shadow-xl shadow-black/10"
                >
                  İZİN TALEBİ OLUŞTUR
                </button>
                <button onClick={() => handleDelete(emp.id)} className="w-16 h-16 bg-gray-50 text-gray-400 rounded-[2.2rem] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 shadow-sm">
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. OPERATION SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <h3 className="text-2xl font-black text-gray-900 uppercase">Operasyon Özeti</h3>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest">
              {departments.length} Departman
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Bekleyen Departman İşi</p>
              <p className="text-lg font-black text-gray-900 mt-1">
                {departments.filter((item) => (item.employeeCount || 0) === 0).length} boş departman
              </p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">İzinli Çalışan</p>
              <p className="text-lg font-black text-gray-900 mt-1">{stats.onLeave} kişi şu an izinli</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Ortalama Performans</p>
              <p className="text-lg font-black text-gray-900 mt-1">%{stats.avgPerformance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      <AnimatePresence>
        {isEmployeeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEmployeeModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-10 shadow-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <BriefcaseIcon className="w-7 h-7 text-[#004aad]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase">Yeni Çalışan Kaydı</h2>
                    <p className="text-gray-400 font-medium tracking-tight">Kadroya yeni bir yetenek ekleyin.</p>
                  </div>
                </div>
                <button onClick={() => setIsEmployeeModalOpen(false)} className="p-3 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" required placeholder="Ad Soyad" value={employeeForm.name} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
                  <input type="text" required placeholder="Pozisyon" value={employeeForm.position} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, position: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="E-Posta" value={employeeForm.email} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
                  <input type="tel" placeholder="Telefon" value={employeeForm.phone} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={employeeForm.departmentId} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, departmentId: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold appearance-none" required>
                    {departments.length ? (
                      departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)
                    ) : (
                      <option value="">Önce departman ekleyin</option>
                    )}
                  </select>
                  <input type="number" required placeholder="Net Maaş" value={employeeForm.salary} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, salary: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-emerald-600" />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">IPTAL</button>
                  <button type="submit" disabled={saving || !departments.length} className="flex-1 py-4 bg-[#004aad] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all disabled:opacity-50">SİSTEME KAYDET</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Department Modal */}
      <AnimatePresence>
        {isDepartmentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDepartmentModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] p-8 shadow-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 uppercase">Departman Yönetimi</h2>
                <button onClick={() => setIsDepartmentModalOpen(false)} className="p-3 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={createDepartment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Yeni departman adı"
                  value={departmentDraft}
                  onChange={(e) => setDepartmentDraft(e.target.value)}
                  className="flex-1 p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold"
                />
                <button type="submit" disabled={saving} className="px-4 py-3 rounded-2xl bg-[#004aad] text-white font-black text-xs uppercase tracking-wide disabled:opacity-50">
                  Ekle
                </button>
              </form>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {departments.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-gray-100 p-3">
                    {departmentEdit.id === d.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={departmentEdit.name}
                          onChange={(e) => setDepartmentEdit({ id: d.id, name: e.target.value })}
                          className="flex-1 p-3 bg-gray-50 rounded-xl border-none outline-none font-semibold"
                        />
                        <button type="button" onClick={renameDepartment} className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs">Kaydet</button>
                        <button type="button" onClick={() => setDepartmentEdit({ id: "", name: "" })} className="px-3 py-2 bg-gray-50 text-gray-500 rounded-xl font-black text-xs">Vazgeç</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-gray-900">{d.name}</p>
                          <p className="text-xs text-gray-500">{d.employeeCount || 0} çalışan</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setDepartmentEdit({ id: d.id, name: d.name })} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-[#004aad]">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deleteDepartment(d.id)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-rose-500">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {!departments.length ? (
                  <div className="rounded-2xl bg-gray-50 text-gray-500 text-sm px-4 py-5 text-center font-semibold">
                    Henüz departman yok.
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Request Modal */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLeaveModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 shadow-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-8 h-8 text-[#004aad]" />
                  <h2 className="text-2xl font-black text-gray-900 uppercase">İzin Talebi Oluştur</h2>
                </div>
                <button onClick={() => setIsLeaveModalOpen(false)} className="p-3 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={createLeaveRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select required value={leaveForm.employeeId} onChange={(e) => setLeaveForm((prev) => ({ ...prev, employeeId: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold">
                    <option value="">Çalışan seçin</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  <select value={leaveForm.leaveType} onChange={(e) => setLeaveForm((prev) => ({ ...prev, leaveType: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold">
                    {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold" />
                  <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold" />
                </div>
                <textarea required rows={3} placeholder="İzin nedeni" value={leaveForm.reason} onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold resize-none" />
                <textarea rows={2} placeholder="Not (opsiyonel)" value={leaveForm.notes} onChange={(e) => setLeaveForm((prev) => ({ ...prev, notes: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-semibold resize-none" />
                <button type="submit" disabled={saving} className="w-full py-4 bg-[#004aad] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-black transition-all disabled:opacity-60">
                  {saving ? "GÖNDERİLİYOR..." : "TALEBİ OLUŞTUR"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
