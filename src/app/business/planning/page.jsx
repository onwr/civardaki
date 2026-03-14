"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BoltIcon,
  TrashIcon,
  FlagIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const TYPE_OPTIONS = ["ALL", "TASK", "PROJECT", "SHIFT"];
const STATUS_OPTIONS = ["ALL", "TODO", "IN_PROGRESS", "DONE"];

function typeLabel(value) {
  if (value === "TASK") return "GÖREV";
  if (value === "PROJECT") return "PROJE";
  if (value === "SHIFT") return "VARDİYA";
  return "TÜMÜ";
}

function statusLabel(value) {
  if (value === "DONE") return "TAMAMLANDI";
  if (value === "IN_PROGRESS") return "DEVAM EDİYOR";
  return "PLANLANDI";
}

function priorityLabel(value) {
  if (value === "HIGH") return "KRİTİK";
  if (value === "LOW") return "DÜŞÜK";
  return "NORMAL";
}

export default function PlanningPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    doneCount: 0,
    inProgressCount: 0,
    overdueCount: 0,
    avgProgress: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "TASK",
    priority: "MEDIUM",
    status: "TODO",
    progress: 0,
    assignedTo: "",
    dueDate: "",
    budget: "",
    estimatedHours: "",
    spentHours: "",
    projectId: "",
    projectName: "",
  });

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (filterType !== "ALL") params.set("type", filterType);
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/business/planning?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Planlama verileri alınamadı.");
      }

      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setSummary({
        totalCount: Number(data.summary?.totalCount || 0),
        doneCount: Number(data.summary?.doneCount || 0),
        inProgressCount: Number(data.summary?.inProgressCount || 0),
        overdueCount: Number(data.summary?.overdueCount || 0),
        avgProgress: Number(data.summary?.avgProgress || 0),
      });
      setPagination({
        page: Number(data.pagination?.page || 1),
        limit: Number(data.pagination?.limit || 20),
        total: Number(data.pagination?.total || 0),
        totalPages: Number(data.pagination?.totalPages || 1),
      });
    } catch (e) {
      setTasks([]);
      setProjects([]);
      setSummary({ totalCount: 0, doneCount: 0, inProgressCount: 0, overdueCount: 0, avgProgress: 0 });
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
      setError(e.message || "Planlama verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, page, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchPlanning, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchPlanning, searchTerm]);

  const avgProgressBarWidth = useMemo(
    () => `${Math.max(0, Math.min(100, summary.avgProgress || 0))}%`,
    [summary.avgProgress]
  );

  function openCreateModal() {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      taskType: "TASK",
      priority: "MEDIUM",
      status: "TODO",
      progress: 0,
      assignedTo: "",
      dueDate: "",
      budget: "",
      estimatedHours: "",
      spentHours: "",
      projectId: "",
      projectName: "",
    });
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      taskType: task.taskType || "TASK",
      priority: task.priority || "MEDIUM",
      status: task.status || "TODO",
      progress: Number(task.progress || 0),
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      budget: task.budget ?? "",
      estimatedHours: task.estimatedHours ?? "",
      spentHours: task.spentHours ?? "",
      projectId: task.projectId || "",
      projectName: "",
    });
    setModalOpen(true);
  }

  async function submitForm() {
    if (!form.title.trim()) {
      toast.error("Başlık zorunlu.");
      return;
    }

    setSaving(true);
    try {
      const method = editingTask ? "PATCH" : "POST";
      const url = editingTask ? `/api/business/planning/${editingTask.id}` : "/api/business/planning";
      const body = {
        title: form.title,
        description: form.description,
        taskType: form.taskType,
        priority: form.priority,
        status: form.status,
        progress: Number(form.progress || 0),
        assignedTo: form.assignedTo,
        dueDate: form.dueDate || null,
        budget: form.budget === "" ? 0 : Number(form.budget),
        estimatedHours: form.estimatedHours === "" ? null : Number(form.estimatedHours),
        spentHours: form.spentHours === "" ? null : Number(form.spentHours),
        projectId: form.projectId || null,
        projectName: form.projectName || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Kayıt işlemi başarısız.");
      }

      toast.success(editingTask ? "Görev güncellendi." : "Görev eklendi.");
      setModalOpen(false);
      await fetchPlanning();
    } catch (e) {
      toast.error(e.message || "Kayıt işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(task, status) {
    setSaving(true);
    try {
      const res = await fetch(`/api/business/planning/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          progress: status === "DONE" ? 100 : task.progress,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Durum güncellenemedi.");
      }
      await fetchPlanning();
    } catch (e) {
      toast.error(e.message || "Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(taskId) {
    setSaving(true);
    try {
      const res = await fetch(`/api/business/planning/${taskId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Görev silinemedi.");
      }
      toast.success("Görev silindi.");
      await fetchPlanning();
    } catch (e) {
      toast.error(e.message || "Görev silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE PLANNING MATRIX HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <ClipboardDocumentListIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">İş Planlama</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Operasyonel Görev ve Proje Yönetimi</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95"
          >
            <PlusIcon className="w-6 h-6" /> YENİ GÖREV EKLE
          </button>
        </div>

        {/* Dynamic Capacity & Load Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Operasyonel Yük</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white tracking-tighter italic">%{summary.avgProgress}</span>
              <div className="w-24 h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: avgProgressBarWidth }} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Ortalama İlerleme</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">%{summary.avgProgress}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Gecikme Riski</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{summary.overdueCount}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Kaynak Verimliliği</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              <span className="text-xl font-black italic">{summary.doneCount}/{summary.totalCount} TAMAM</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED DISCOVERY BAR */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-col gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Görev adı, departman veya anahtar kelime ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setPage(1);
                setFilterType(type);
              }}
              className={`px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${filterType === type ? 'bg-[#004aad] text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-[#004aad]'
                }`}
            >
              {typeLabel(type)}
            </button>
          ))}
          <select
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setFilterStatus(e.target.value);
            }}
            className="px-6 py-4 bg-gray-50 text-gray-600 rounded-[1.5rem] border border-gray-100 font-black text-[11px] uppercase tracking-widest outline-none"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "TÜM DURUMLAR" : statusLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mx-2 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {/* 3. PLANNING LIST (SINGLE COLUMN) */}
      <div className="space-y-6 mx-2">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 p-12 text-center text-gray-500 font-semibold">
            Bu filtrelere uygun görev bulunamadı.
          </div>
        ) : (
          tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden p-8 md:p-10"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-20 shrink-0">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                    <ClipboardDocumentListIcon className="w-10 h-10 text-[#004aad]" />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 rounded-full text-[8px] font-black tracking-widest border ${task.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {statusLabel(task.status)}
                      </span>
                      <span className={`px-3 py-2 rounded-full text-[8px] font-black tracking-widest border ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        task.priority === 'LOW' ? 'bg-gray-50 text-gray-600 border-gray-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        } flex items-center gap-1`}>
                        <FlagIcon className="w-3 h-3" />
                        {priorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {task.description || "Açıklama girilmemiş."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÖREV İLERLEMESİ</span>
                      <span className="text-xs font-black text-[#004aad] italic">%{task.progress}</span>
                    </div>
                    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, Number(task.progress || 0)))}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${task.status === 'DONE' ? 'from-emerald-400 to-emerald-500' : 'from-[#004aad] to-blue-400'} rounded-full`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                          {task.spentHours ?? 0}/{task.estimatedHours ?? 0} Saat
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">
                          {task.assignedTo || "Atanmadı"}
                        </span>
                      </div>
                    </div>

                    <div className="md:text-right space-y-2">
                      <div className="flex items-center md:justify-end gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("tr-TR") : "Tarih yok"}
                        </span>
                      </div>
                      <div className="flex items-center md:justify-end gap-1 text-emerald-600">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span className="text-xs font-black">₺{Number(task.budget || 0).toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(task)}
                      className="py-4 px-5 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <BoltIcon className="w-4 h-4" /> DÜZENLE
                    </button>
                    {task.status !== "DONE" ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => changeStatus(task, "DONE")}
                        className="py-4 px-5 bg-[#004aad] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 h-4" /> TAMAMLA
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => changeStatus(task, "IN_PROGRESS")}
                        className="py-4 px-5 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <BoltIcon className="w-4 h-4" /> DEVAMA AL
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => removeTask(task.id)}
                      className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mx-2 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            Geri
          </button>
          <span className="text-sm font-semibold text-gray-500 px-3">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            İleri
          </button>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {editingTask ? "Görevi Düzenle" : "Yeni Görev"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Planlama kaydını düzenleyin ve operasyon akışına ekleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Başlık</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Açıklama</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[96px] px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Görev Tipi</span>
                <select
                  value={form.taskType}
                  onChange={(e) => setForm((prev) => ({ ...prev, taskType: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                >
                  <option value="TASK">GÖREV</option>
                  <option value="PROJECT">PROJE</option>
                  <option value="SHIFT">VARDİYA</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Öncelik</span>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                >
                  <option value="LOW">DÜŞÜK</option>
                  <option value="MEDIUM">NORMAL</option>
                  <option value="HIGH">KRİTİK</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Durum</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                >
                  <option value="TODO">PLANLANDI</option>
                  <option value="IN_PROGRESS">DEVAM EDİYOR</option>
                  <option value="DONE">TAMAMLANDI</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">İlerleme (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm((prev) => ({ ...prev, progress: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Atanan Kişi / Ekip</span>
                <input
                  value={form.assignedTo}
                  onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Bitiş Tarihi</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Bütçe (₺)</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Tahmini Saat</span>
                <input
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, estimatedHours: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Harcanan Saat</span>
                <input
                  type="number"
                  value={form.spentHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, spentHours: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Proje</span>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                >
                  <option value="">Proje seçilmedi</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              {!editingTask ? (
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Yeni Proje Adı (Opsiyonel)</span>
                  <input
                    value={form.projectName}
                    onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                    placeholder="Proje seçmezsen yeni proje oluşturulur"
                  />
                </label>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={saving}
                className="h-11 px-5 rounded-xl bg-[#004aad] text-white font-semibold disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : editingTask ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
