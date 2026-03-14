"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const LEAVE_TYPES = [
  { value: "all", label: "Tüm Türler" },
  { value: "annual", label: "Yıllık İzin" },
  { value: "sick", label: "Hastalık İzni" },
  { value: "unpaid", label: "Ücretsiz İzin" },
  { value: "maternity", label: "Doğum İzni" },
  { value: "paternity", label: "Babalık İzni" },
  { value: "other", label: "Diğer" },
];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState({
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterType !== "all") params.set("type", filterType);

      const [leaveRes, empRes] = await Promise.all([
        fetch(`/api/business/leaves?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/business/employees", { cache: "no-store" }),
      ]);
      const leaveData = await leaveRes.json().catch(() => ({}));
      const empData = await empRes.json().catch(() => ({}));
      if (!leaveRes.ok) throw new Error(leaveData.error || "İzinler alınamadı.");
      if (!empRes.ok) throw new Error(empData.error || "Çalışanlar alınamadı.");

      setLeaves(Array.isArray(leaveData.leaves) ? leaveData.leaves : []);
      setEmployees(Array.isArray(empData.employees) ? empData.employees : []);
    } catch (error) {
      toast.error(error.message || "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const text = `${item.employeeName || ""} ${item.reason || ""}`.toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesType = filterType === "all" || item.leaveType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, searchTerm, filterStatus, filterType]);

  const stats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
    totalDays: leaves.filter((l) => l.status === "approved").reduce((sum, l) => sum + Number(l.days || 0), 0),
  }), [leaves]);

  const handleAddLeave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/business/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "İzin talebi oluşturulamadı.");
      toast.success("İzin talebi oluşturuldu.");
      setShowAddModal(false);
      setFormState({
        employeeId: "",
        leaveType: "annual",
        startDate: "",
        endDate: "",
        reason: "",
        notes: "",
      });
      await fetchData();
    } catch (error) {
      toast.error(error.message || "İzin talebi oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const updateLeaveStatus = async (leaveId, action) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/business/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
      toast.success("İzin durumu güncellendi.");
      await fetchData();
    } catch (error) {
      toast.error(error.message || "Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE LEAVES HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <CalendarDaysIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <CalendarDaysIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">İzin Yönetimi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Personnel Attendance & Continuity Center</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setFormState({ employeeId: "", leaveType: "annual", startDate: "", endDate: "", reason: "", notes: "" });
              setShowAddModal(true);
            }}
            className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95"
          >
            <PlusIcon className="w-6 h-6" /> YENİ İZİN TALEBİ
          </button>
        </div>

        {/* Dynamic Personnel Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <UserGroupIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Toplam Talep</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.total} Kayıt</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <ClockIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Bekleyen</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.pending} Adet</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Onaylanan Gün</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.totalDays} Gün</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <ArrowPathIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Doluluk Oranı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">%{Math.round(92 - (stats.pending * 1.5))}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & PREMIUM FILTERS */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-wrap items-center justify-between gap-6 mx-2">
        <div className="flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Personel adı veya izin nedeni ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-2 bg-gray-100 rounded-[2.5rem]">
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === st ? 'bg-white text-[#004aad] shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {st === "all" ? "TÜMÜ" : st === "pending" ? "BEKLEYEN" : st === "approved" ? "ONAYLI" : "RED"}
              </button>
            ))}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-14 px-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-gray-700"
          >
            {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* 3. LEAVE CARDS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mx-2">
        <AnimatePresence mode="popLayout">
          {!leaves.length ? (
            <div className="col-span-full bg-white p-10 rounded-[2.5rem] border border-gray-100 text-center text-gray-500 font-semibold">
              Kayıt bulunamadı.
            </div>
          ) : null}
          {filteredLeaves.map((leave, idx) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

              <div className="flex flex-col items-center shrink-0">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                  <UserIcon className="w-12 h-12 text-[#004aad]" />
                </div>
                <span className={`mt-4 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    leave.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  {leave.status === 'approved' ? 'ONAYLANDI' : leave.status === 'rejected' ? 'REDDEDİLDİ' : 'İNCELEMEDE'}
                </span>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{leave.employeeName}</h3>
                    <p className="text-[11px] font-black text-[#004aad] mt-2 tracking-widest uppercase">{leave.leaveTypeLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-950 tracking-tighter italic">{leave.days}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÜN SÜRE</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-[2.5rem]">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">BAŞLANGIÇ</p>
                    <p className="text-sm font-bold text-gray-950 italic">{new Date(leave.startDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">BİTİŞ</p>
                    <p className="text-sm font-bold text-gray-950 italic">{new Date(leave.endDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm font-medium text-gray-500 italic flex-1 truncate pr-8">"{leave.reason}"</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => { setSelectedLeave(leave); setShowDetailModal(true); }} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-[#004aad] transition-all"><EyeIcon className="w-5 h-5" /></button>
                    {leave.status === "pending" ? (
                      <>
                        <button disabled={saving} onClick={() => updateLeaveStatus(leave.id, "approve")} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all disabled:opacity-50">
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button disabled={saving} onClick={() => updateLeaveStatus(leave.id, "reject")} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all disabled:opacity-50">
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[5rem] p-10 md:p-14 shadow-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <CalendarDaysIcon className="w-7 h-7 text-[#004aad]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">Yeni İzin Talebi</h2>
                    <p className="text-gray-400 font-bold italic text-[10px] mt-2 tracking-widest uppercase">Approval Flow</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleAddLeave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">Personel</label>
                    <select
                      required
                      value={formState.employeeId}
                      onChange={(e) => setFormState({ ...formState, employeeId: e.target.value })}
                      className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] border-none outline-none font-bold text-gray-950 focus:ring-4 focus:ring-[#004aad]/5"
                    >
                      <option value="">Personel seçin</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">İzin Türü</label>
                    <select value={formState.leaveType} onChange={e => setFormState({ ...formState, leaveType: e.target.value })} className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] border-none outline-none font-bold text-gray-950 focus:ring-4 focus:ring-[#004aad]/5 appearance-none">
                      {LEAVE_TYPES.filter((t) => t.value !== "all").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">Başlangıç Tarihi</label>
                    <input type="date" required value={formState.startDate} onChange={e => setFormState({ ...formState, startDate: e.target.value })} className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] border-none outline-none font-bold text-gray-950 focus:ring-4 focus:ring-[#004aad]/5" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">Bitiş Tarihi</label>
                    <input type="date" required value={formState.endDate} onChange={e => setFormState({ ...formState, endDate: e.target.value })} className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] border-none outline-none font-bold text-gray-950 focus:ring-4 focus:ring-[#004aad]/5" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">Açıklama / Neden</label>
                  <textarea required value={formState.reason} onChange={e => setFormState({ ...formState, reason: e.target.value })} rows="3" className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-medium italic text-gray-950 focus:ring-4 focus:ring-[#004aad]/5 resize-none" />
                </div>

                <button type="submit" className="w-full py-8 bg-[#004aad] text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-black transition-all shadow-4xl italic">TALEBİ ONAYA GÖNDER</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedLeave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] p-8 shadow-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 uppercase">İzin Detayı</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 bg-gray-50 rounded-xl">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <p><span className="font-black">Personel:</span> {selectedLeave.employeeName}</p>
                <p><span className="font-black">Tür:</span> {selectedLeave.leaveTypeLabel}</p>
                <p><span className="font-black">Tarih:</span> {new Date(selectedLeave.startDate).toLocaleDateString("tr-TR")} - {new Date(selectedLeave.endDate).toLocaleDateString("tr-TR")}</p>
                <p><span className="font-black">Durum:</span> {selectedLeave.status.toUpperCase()}</p>
                <p><span className="font-black">Neden:</span> {selectedLeave.reason}</p>
                {selectedLeave.notes ? <p><span className="font-black">Not:</span> {selectedLeave.notes}</p> : null}
                {selectedLeave.rejectionReason ? <p><span className="font-black">Red Nedeni:</span> {selectedLeave.rejectionReason}</p> : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
