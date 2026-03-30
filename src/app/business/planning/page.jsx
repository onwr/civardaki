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
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ArrowPathIcon,
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

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    amber:
      "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ModalShell({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Planlama Kaydı
              </p>
              <h2 className="mt-1 text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function statusTone(status) {
  if (status === "DONE") return "bg-emerald-100 text-emerald-800";
  if (status === "IN_PROGRESS") return "bg-amber-100 text-amber-900";
  return "bg-blue-100 text-blue-800";
}

function priorityTone(priority) {
  if (priority === "HIGH") return "bg-rose-100 text-rose-700";
  if (priority === "LOW") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-800";
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

      const res = await fetch(`/api/business/planning?${params.toString()}`, {
        cache: "no-store",
      });
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
      setSummary({
        totalCount: 0,
        doneCount: 0,
        inProgressCount: 0,
        overdueCount: 0,
        avgProgress: 0,
      });
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
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
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
      const url = editingTask
        ? `/api/business/planning/${editingTask.id}`
        : "/api/business/planning";

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
        estimatedHours:
          form.estimatedHours === "" ? null : Number(form.estimatedHours),
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
    if (!confirm("Bu görev silinsin mi?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/planning/${taskId}`, {
        method: "DELETE",
      });
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
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                  Planlama Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  İş Planlama
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Görev, proje ve vardiya planlamasını tek panelden yönetin.
                  İlerleme, süre ve bütçe takibini aynı ekranda görün.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={openCreateModal} icon={PlusIcon} tone="green">
                  Yeni Görev Ekle
                </ActionButton>
                <ActionButton onClick={fetchPlanning} icon={ArrowPathIcon} tone="white">
                  Yenile
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Kayıt"
              value={summary.totalCount}
              sub="Tüm görev ve planlamalar"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="Tamamlanan"
              value={summary.doneCount}
              sub="Bitirilen kayıtlar"
              icon={CheckCircleIcon}
              tone="emerald"
            />
            <StatCard
              title="Devam Eden"
              value={summary.inProgressCount}
              sub="Aktif süreçler"
              icon={BoltIcon}
              tone="amber"
            />
            <StatCard
              title="Geciken"
              value={summary.overdueCount}
              sub="Süresi aşan kayıtlar"
              icon={ExclamationTriangleIcon}
              tone="slate"
            />
          </div>
        </section>

        <SectionCard
          title="İlerleme Özeti"
          subtitle="Genel operasyonel ilerleme yüzdesi"
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Ortalama ilerleme
              </span>
              <span className="text-lg font-black text-[#004aad]">
                %{summary.avgProgress}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#004aad] to-blue-400"
                style={{ width: avgProgressBarWidth }}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Filtreler"
          subtitle="Kayıtları türe, duruma ve aramaya göre filtreleyin"
        >
          <div className="flex flex-col gap-4">
            <div className="relative max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Görev adı, açıklama veya kişi ara..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setFilterType(type);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                    filterType === type
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 outline-none"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item === "ALL" ? "TÜM DURUMLAR" : statusLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <SectionCard
          title="Görev Listesi"
          subtitle="Planlanan ve aktif tüm kayıtlar"
        >
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <p className="text-sm font-medium text-slate-500">
                Bu filtrelere uygun görev bulunamadı.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {task.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone(
                            task.status
                          )}`}
                        >
                          {statusLabel(task.status)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityTone(
                            task.priority
                          )}`}
                        >
                          {priorityLabel(task.priority)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                          {typeLabel(task.taskType)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {task.description || "Açıklama girilmemiş."}
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <UserGroupIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Atanan
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {task.assignedTo || "Atanmadı"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Bitiş Tarihi
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString("tr-TR")
                              : "Belirlenmedi"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Süre
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {task.spentHours ?? 0}/{task.estimatedHours ?? 0} saat
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Bütçe
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            ₺{Number(task.budget || 0).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            İlerleme
                          </span>
                          <span className="text-sm font-black text-[#004aad]">
                            %{task.progress}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              task.status === "DONE"
                                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                : "bg-gradient-to-r from-[#004aad] to-blue-400"
                            }`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, Number(task.progress || 0))
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                      <ActionButton
                        onClick={() => openEditModal(task)}
                        icon={BoltIcon}
                        tone="white"
                        className="justify-center"
                      >
                        Düzenle
                      </ActionButton>

                      {task.status !== "DONE" ? (
                        <ActionButton
                          onClick={() => changeStatus(task, "DONE")}
                          icon={CheckCircleIcon}
                          tone="blue"
                          className="justify-center"
                          disabled={saving}
                        >
                          Tamamla
                        </ActionButton>
                      ) : (
                        <ActionButton
                          onClick={() => changeStatus(task, "IN_PROGRESS")}
                          icon={BoltIcon}
                          tone="amber"
                          className="justify-center"
                          disabled={saving}
                        >
                          Devama Al
                        </ActionButton>
                      )}

                      <ActionButton
                        onClick={() => removeTask(task.id)}
                        icon={TrashIcon}
                        tone="rose"
                        className="justify-center"
                        disabled={saving}
                      >
                        Sil
                      </ActionButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Geri
            </button>
            <span className="px-3 text-sm font-semibold text-slate-500">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              İleri
            </button>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <ModalShell
          title={editingTask ? "Görevi Düzenle" : "Yeni Görev"}
          onClose={() => setModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3">
              <ActionButton
                onClick={() => setModalOpen(false)}
                tone="white"
              >
                Vazgeç
              </ActionButton>
              <ActionButton
                onClick={submitForm}
                icon={CheckCircleIcon}
                tone="green"
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : editingTask ? "Güncelle" : "Kaydet"}
              </ActionButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Başlık
              </span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Açıklama
              </span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Görev Tipi
              </span>
              <select
                value={form.taskType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, taskType: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              >
                <option value="TASK">GÖREV</option>
                <option value="PROJECT">PROJE</option>
                <option value="SHIFT">VARDİYA</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Öncelik
              </span>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              >
                <option value="LOW">DÜŞÜK</option>
                <option value="MEDIUM">NORMAL</option>
                <option value="HIGH">KRİTİK</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Durum
              </span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              >
                <option value="TODO">PLANLANDI</option>
                <option value="IN_PROGRESS">DEVAM EDİYOR</option>
                <option value="DONE">TAMAMLANDI</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                İlerleme (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, progress: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Atanan Kişi / Ekip
              </span>
              <input
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, assignedTo: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Bitiş Tarihi
              </span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Bütçe (₺)
              </span>
              <input
                type="number"
                value={form.budget}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, budget: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Tahmini Saat
              </span>
              <input
                type="number"
                value={form.estimatedHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, estimatedHours: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Harcanan Saat
              </span>
              <input
                type="number"
                value={form.spentHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, spentHours: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Proje
              </span>
              <select
                value={form.projectId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, projectId: e.target.value }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
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
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Yeni Proje Adı
                </span>
                <input
                  value={form.projectName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, projectName: e.target.value }))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
                  placeholder="İstersen yeni proje adı gir"
                />
              </label>
            ) : null}
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}