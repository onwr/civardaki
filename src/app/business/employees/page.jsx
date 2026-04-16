"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
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
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

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
  if (status === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "ON_LEAVE") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "REMOTE") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-500";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("tr-TR");
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
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
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

function ModalShell({ title, children, onClose, footer, size = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div
        className={`relative z-10 w-full ${size} max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]`}
      >
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                İnsan Kaynakları
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

  const [newEmployeeAvatarFile, setNewEmployeeAvatarFile] = useState(null);
  const [newEmployeeAvatarPreview, setNewEmployeeAvatarPreview] = useState(null);

  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    notes: "",
  });

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
      setStats(
        empData.stats || {
          total: 0,
          totalSalary: 0,
          avgPerformance: 0,
          onLeave: 0,
        }
      );
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

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!isEmployeeModalOpen) {
      setNewEmployeeAvatarFile(null);
    }
  }, [isEmployeeModalOpen]);

  useEffect(() => {
    if (!newEmployeeAvatarFile) {
      setNewEmployeeAvatarPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(newEmployeeAvatarFile);
    setNewEmployeeAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newEmployeeAvatarFile]);

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

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Çalışan kaydedilemedi.");

      const newId = result?.id;
      const hadAvatarFile = Boolean(newEmployeeAvatarFile);
      let avatarOk = false;
      if (newEmployeeAvatarFile && newId) {
        try {
          const fd = new FormData();
          fd.append("file", newEmployeeAvatarFile);
          fd.append("type", "GALLERY");
          const uploadRes = await fetch("/api/business/upload", {
            method: "POST",
            body: fd,
          });
          const uploadData = await uploadRes.json().catch(() => ({}));
          if (uploadRes.ok && uploadData.url) {
            const patchRes = await fetch(`/api/business/employees/${newId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ avatar: uploadData.url }),
            });
            const patchData = await patchRes.json().catch(() => ({}));
            if (patchRes.ok) avatarOk = true;
            else
              toast.warning(
                patchData.error ||
                  "Çalışan kaydedildi; profil fotoğrafı kaydedilemedi. Detay sayfasından tekrar deneyebilirsiniz.",
              );
          } else {
            toast.warning(
              uploadData.message ||
                "Çalışan kaydedildi; profil fotoğrafı yüklenemedi. Detay sayfasından tekrar deneyebilirsiniz.",
            );
          }
        } catch {
          toast.warning(
            "Çalışan kaydedildi; profil fotoğrafı işlenirken hata oluştu. Detay sayfasından yükleyebilirsiniz.",
          );
        }
      }

      setNewEmployeeAvatarFile(null);
      if (avatarOk) {
        toast.success("Yeni çalışan kaydedildi ve profil fotoğrafı eklendi.");
      } else if (hadAvatarFile && !avatarOk) {
        /* uyarı mesajları yukarıda gösterildi */
      } else {
        toast.success("Yeni çalışan başarıyla kaydedildi.");
      }
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
      const res = await fetch(`/api/business/employees?id=${id}`, {
        method: "DELETE",
      });
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
      const res = await fetch(`/api/business/departments/${id}`, {
        method: "DELETE",
      });

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
    return employees.filter((employee) => {
      const text = `${employee.name || ""} ${employee.position || ""} ${employee.department || ""} ${employee.email || ""}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesDept =
        filterDepartment === "all" || employee.department === filterDepartment;
      return matchesSearch && matchesDept;
    });
  }, [employees, filterDepartment, searchTerm]);

  const departmentFilterOptions = useMemo(() => {
    return ["all", ...departments.map((d) => d.name).filter(Boolean)];
  }, [departments]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <BriefcaseIcon className="h-4 w-4" />
                  İnsan Kaynakları
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Ekip Yönetimi
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Çalışanları, departmanları ve izin süreçlerini tek panelden yönetin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={() => setIsEmployeeModalOpen(true)}
                  icon={PlusIcon}
                  tone="green"
                  disabled={!departments.length}
                >
                  Yeni Çalışan
                </ActionButton>

                <ActionButton
                  onClick={() => setIsLeaveModalOpen(true)}
                  icon={CalendarDaysIcon}
                  tone="blue"
                  disabled={!employees.length}
                >
                  İzin Talebi
                </ActionButton>

                <ActionButton
                  onClick={() => setIsDepartmentModalOpen(true)}
                  icon={BuildingOffice2Icon}
                  tone="white"
                >
                  Departmanlar
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Çalışan"
              value={stats.total}
              sub="Aktif kayıtlar"
              icon={UserGroupIcon}
              tone="blue"
            />
            <StatCard
              title="Aylık Toplam Maaş"
              value={`₺${formatMoney(stats.totalSalary)}`}
              sub="Toplam bordro yükü"
              icon={BanknotesIcon}
              tone="emerald"
            />
            <StatCard
              title="Ortalama Performans"
              value={`%${stats.avgPerformance}`}
              sub="Genel ekip skoru"
              icon={BoltIcon}
              tone="amber"
            />
            <StatCard
              title="İzinli Çalışan"
              value={stats.onLeave}
              sub="Şu an izinli"
              icon={CalendarDaysIcon}
              tone="slate"
            />
          </div>
        </section>

        {!departments.length ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Önce departman oluşturmalısınız</p>
                <p className="mt-1 text-sm">
                  Çalışan ekleyebilmek için en az bir departman tanımlı olmalı.
                </p>
              </div>
              <ActionButton
                onClick={() => setIsDepartmentModalOpen(true)}
                tone="white"
                className="shrink-0"
              >
                Departman Oluştur
              </ActionButton>
            </div>
          </div>
        ) : null}

        <SectionCard
          title="Filtreler"
          subtitle="Çalışan listesini arama ve departmana göre daraltın"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="İsim, pozisyon, departman veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
            >
              {departmentFilterOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "Tüm Departmanlar" : dept}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        <SectionCard
          title="Çalışan Kartları"
          subtitle="Ekip üyelerini görüntüleyin ve hızlı işlemler uygulayın"
        >
          {filteredEmployees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <p className="text-sm font-medium text-slate-500">
                Çalışan kaydı bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filteredEmployees.map((emp, idx) => (
                  <motion.div
                    key={emp.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-200/90 text-slate-500 shadow-sm">
                          {emp.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={emp.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <UserCircleIcon className="h-11 w-11" aria-hidden />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-slate-900">
                            {emp.name}
                          </h3>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            {emp.position || "Pozisyon yok"}
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-600">
                            {emp.department || "Departman yok"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(
                          emp.status
                        )}`}
                      >
                        {statusLabel(emp.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Performans
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-900">
                          %{emp.performance || 0}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Maaş
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-900">
                          ₺{formatMoney(emp.salary)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                        <span className="truncate text-sm font-medium text-slate-700">
                          {emp.email || "E-posta yok"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {emp.phone || "Telefon yok"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <ClockIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {emp.leaves || 0} kullanılan izin / {emp.pendingLeaveCount || 0} bekleyen
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/business/employees/${emp.id}`}
                        className="inline-flex flex-1 min-w-[6rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Detay
                      </Link>
                      <ActionButton
                        onClick={() => {
                          setLeaveForm((prev) => ({ ...prev, employeeId: emp.id }));
                          setIsLeaveModalOpen(true);
                        }}
                        icon={CalendarDaysIcon}
                        tone="blue"
                        className="flex-1 min-w-[6rem] justify-center"
                      >
                        İzin
                      </ActionButton>

                      <ActionButton
                        onClick={() => handleDelete(emp.id)}
                        icon={TrashIcon}
                        tone="rose"
                        className="justify-center"
                      >
                        Sil
                      </ActionButton>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Operasyon Özeti"
          subtitle="Departman ve ekip durumuna hızlı bakış"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Boş Departman
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {departments.filter((item) => (item.employeeCount || 0) === 0).length} adet
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                İzinli Personel
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {stats.onLeave} kişi
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Ortalama Performans
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                %{stats.avgPerformance}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <AnimatePresence>
        {isEmployeeModalOpen ? (
          <ModalShell
            title="Yeni Çalışan Kaydı"
            onClose={() => setIsEmployeeModalOpen(false)}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={() => setIsEmployeeModalOpen(false)} tone="white">
                  Vazgeç
                </ActionButton>
                <ActionButton
                  type="submit"
                  onClick={handleAddEmployee}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving || !departments.length}
                >
                  Kaydet
                </ActionButton>
              </div>
            }
          >
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleAddEmployee}>
              <div className="md:col-span-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-200/90 text-slate-500">
                  {newEmployeeAvatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newEmployeeAvatarPreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Profil fotoğrafı (isteğe bağlı)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setNewEmployeeAvatarFile(f);
                    }}
                    className="w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
                  />
                  <p className="text-xs text-slate-500">
                    JPEG, PNG veya WebP; en fazla 5 MB. Boş bırakırsanız kartta varsayılan simge kullanılır; sonra detay
                    sayfasından da ekleyebilirsiniz.
                  </p>
                </div>
              </div>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Ad Soyad
                </span>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Pozisyon
                </span>
                <input
                  type="text"
                  required
                  value={employeeForm.position}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, position: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  E-Posta
                </span>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Telefon
                </span>
                <input
                  type="tel"
                  value={employeeForm.phone}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Departman
                </span>
                <select
                  value={employeeForm.departmentId}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  required
                >
                  {departments.length ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Önce departman ekleyin</option>
                  )}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Net Maaş
                </span>
                <input
                  type="number"
                  required
                  value={employeeForm.salary}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, salary: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>
            </form>
          </ModalShell>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isDepartmentModalOpen ? (
          <ModalShell
            title="Departman Yönetimi"
            onClose={() => setIsDepartmentModalOpen(false)}
            size="max-w-xl"
          >
            <form onSubmit={createDepartment} className="mb-5 flex gap-2">
              <input
                type="text"
                placeholder="Yeni departman adı"
                value={departmentDraft}
                onChange={(e) => setDepartmentDraft(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <ActionButton type="submit" icon={PlusIcon} tone="green" disabled={saving}>
                Ekle
              </ActionButton>
            </form>

            <div className="space-y-3">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {departmentEdit.id === d.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={departmentEdit.name}
                        onChange={(e) =>
                          setDepartmentEdit({ id: d.id, name: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                      />
                      <ActionButton onClick={renameDepartment} tone="green" disabled={saving}>
                        Kaydet
                      </ActionButton>
                      <ActionButton
                        onClick={() => setDepartmentEdit({ id: "", name: "" })}
                        tone="white"
                      >
                        Vazgeç
                      </ActionButton>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {d.employeeCount || 0} çalışan
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDepartmentEdit({ id: d.id, name: d.name })}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#004aad]"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDepartment(d.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!departments.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm font-medium text-slate-500">
                  Henüz departman yok.
                </div>
              ) : null}
            </div>
          </ModalShell>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isLeaveModalOpen ? (
          <ModalShell
            title="İzin Talebi Oluştur"
            onClose={() => setIsLeaveModalOpen(false)}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={() => setIsLeaveModalOpen(false)} tone="white">
                  Vazgeç
                </ActionButton>
                <ActionButton
                  type="submit"
                  onClick={createLeaveRequest}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving}
                >
                  Talebi Oluştur
                </ActionButton>
              </div>
            }
          >
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createLeaveRequest}>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Çalışan
                </span>
                <select
                  required
                  value={leaveForm.employeeId}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, employeeId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Çalışan seçin</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  İzin Türü
                </span>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, leaveType: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Başlangıç Tarihi
                </span>
                <input
                  type="date"
                  required
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Bitiş Tarihi
                </span>
                <input
                  type="date"
                  required
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  İzin Nedeni
                </span>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Not
                </span>
                <textarea
                  rows={2}
                  value={leaveForm.notes}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none"
                />
              </label>
            </form>
          </ModalShell>
        ) : null}
      </AnimatePresence>
    </div>
  );
}